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

  const db = { ...((data?.data as Record<string, unknown>) ?? {}) }
  // Solo en local: HOME_PREVIEW_DEFAULTS=hero,showcase usa los textos del código para esas secciones
  for (const k of (process.env.HOME_PREVIEW_DEFAULTS ?? '').split(',').map((x) => x.trim()).filter(Boolean)) delete db[k]
  return deepMerge(DEFAULT_HOME_CONTENT, db)
}
