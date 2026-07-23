import BlogForm from '../BlogForm'
import { createPost } from '../actions'

export default function NewPostPage() {
  return <BlogForm action={createPost} />
}
