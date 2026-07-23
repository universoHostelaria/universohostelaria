import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import BlogForm from '../BlogForm'
import { updatePost } from '../actions'
import type { BlogPost } from '@/lib/blog'

export default async function EditPostPage({ params }: { params: { slug: string } }) {
  const supabase = createClient()
  const { data: post } = await supabase.from('blog_posts').select('*').eq('slug', params.slug).single()
  if (!post) notFound()
  const action = updatePost.bind(null, params.slug)
  return <BlogForm post={post as BlogPost} action={action} />
}
