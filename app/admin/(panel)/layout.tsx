import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import AdminNav from './AdminNav'
import '../admin.css'

export const metadata = { title: 'Admin — Universo Hostelería' }

// Sem cache: o painel sempre reflete os dados atuais.
export const dynamic = 'force-dynamic'

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Defesa em profundidade (o middleware já redireciona).
  if (!user) redirect('/admin/login')

  return (
    <div className="adm-body">
      <div className="adm-shell">
        <AdminNav email={user.email ?? ''} />
        <main className="adm-main">{children}</main>
      </div>
    </div>
  )
}
