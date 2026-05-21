import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { PostEditor } from '@/components/posts/PostEditor'

export const dynamic = 'force-dynamic'

interface PostPageProps {
  params: Promise<{ id: string }>
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params

  const post = await db.socialPost.findUnique({
    where: { id },
    include: { blogPost: true },
  })

  if (!post) notFound()

  return <PostEditor post={post} />
}
