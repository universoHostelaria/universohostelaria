import { supabase } from '@/lib/supabase'
import { DEFAULT_HOME_CONTENT, deepMerge, type HomeContent } from '@/lib/home-content'

// Lê o conteúdo da home do banco (site_content key='home') e faz
// merge por cima dos padrões. Se não houver linha, usa os padrões.
export async function getHomeContent(): Promise<HomeContent> {
  const { data } = await supabase
    .from('site_content')
    .select('data')
    .eq('key', 'home')
    .maybeSingle()

  return deepMerge(DEFAULT_HOME_CONTENT, data?.data ?? {})
}
