import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Clock } from 'lucide-react'
import type { SocialPostWithBlog } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface PendingPostsListProps {
  posts: SocialPostWithBlog[]
}

export function PendingPostsList({ posts }: PendingPostsListProps) {
  if (posts.length === 0) {
    return (
      <div className="bg-white border border-[#E2E8F0] rounded-lg p-8 text-center shadow-sm">
        <Clock className="w-8 h-8 text-[#64748B] mx-auto mb-2 opacity-40" />
        <p className="text-[#0F172A] font-medium text-sm">Sin borradores pendientes</p>
        <p className="text-[#64748B] text-xs mt-1">
          Sincroniza los blogs y genera tu primer post desde la{' '}
          <Link href="/blogs" className="text-[#1A8F8A] hover:underline">
            Biblioteca de Blogs
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm divide-y divide-[#E2E8F0]">
      {posts.map((post) => (
        <div key={post.id} className="flex items-center gap-4 p-4 hover:bg-[#F8FAFC] transition-colors">
          {/* Plataformas */}
          <div className="flex gap-1">
            <div className="w-7 h-7 rounded bg-[#0A66C2]/10 flex items-center justify-center">
              <span className="text-[#0A66C2] font-bold text-xs">in</span>
            </div>
            <div className="w-7 h-7 rounded bg-[#E1306C]/10 flex items-center justify-center">
              <span className="text-[#E1306C] font-bold text-xs">IG</span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#0F172A] truncate">
              {post.blogPost.title}
            </p>
            <p className="text-xs text-[#64748B] truncate mt-0.5">
              {post.linkedinText.slice(0, 80)}…
            </p>
          </div>

          {/* Tiempo */}
          <span className="text-xs text-[#64748B] whitespace-nowrap">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: es })}
          </span>

          {/* CTA */}
          <Link href={`/posts/${post.id}`}>
            <Button size="sm" className="gap-1 text-xs h-7 px-3 text-white whitespace-nowrap"
              style={{ backgroundColor: '#1A8F8A' }}>
              Revisar
              <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      ))}
    </div>
  )
}
