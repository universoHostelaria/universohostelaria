import { getHomeContent } from '@/lib/home-content-server'
import ContentEditor from './ContentEditor'

export default async function ContentPage() {
  const content = await getHomeContent()
  return <ContentEditor initial={content} />
}
