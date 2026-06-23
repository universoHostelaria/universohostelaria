import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Renova a sessão (importante: não colocar código entre isto e o retorno)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isAdmin = pathname.startsWith('/admin')
  const isLogin = pathname === '/admin/login'

  // Sem sessão tentando acessar /admin → manda pro login
  if (isAdmin && !isLogin && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // Já logado abrindo /admin/login → manda pro dashboard
  if (isLogin && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    url.searchParams.delete('next')
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  // Roda em /admin/* (e ignora estáticos). Mantém a sessão viva.
  matcher: ['/admin/:path*'],
}
