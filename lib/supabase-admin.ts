import { createClient } from '@supabase/supabase-js'

// Client service_role — SOMENTE no servidor. Bypassa RLS.
// Use em server actions/rotas admin quando precisar de poder total
// (ex.: upload em lote, operações que a sessão do usuário não cobre).
// NUNCA importar em código 'use client'.
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!key) throw new Error('SUPABASE_SERVICE_KEY não definida no ambiente')

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
