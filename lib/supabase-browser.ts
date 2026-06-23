'use client'

import { createBrowserClient } from '@supabase/ssr'

// Client para uso no browser (componentes 'use client').
// Respeita RLS via sessão do usuário logado.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
