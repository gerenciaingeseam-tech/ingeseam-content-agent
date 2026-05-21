import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { StatusBadge } from '@/components/posts/StatusBadge'
import { DeletePostButton } from '@/components/posts/DeletePostButton'
import { ArrowRight, Calendar } from 'lucide-react'
import type { SocialPostWithBlog } from '@/types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface PostCardProps {
  post: SocialPostWithBlog
}

export function PostCard({ post }: PostCardProps) {
  const canDelete = post.status === 'REJECTED' || post.status === 'DRAFT'

  return (
    <Card className="border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <CardContent className="p-4 flex-1 space-y-3">
        {/* Blog fuente */}
        <p className="text-xs text-[#64748B] font-medium uppercase tracking-wide">
          {post.blogPost.title}
        </p>

        {/* Preview del texto */}
        <p className="text-sm text-[#0F172A] leading-relaxed line-clamp-3">
          {post.linkedinText.slice(0, 120)}…
        </p>

        {/* Meta */}
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={post.status} />

          <div className="flex gap-1 ml-auto">
            <div className="w-6 h-6 rounded bg-[#0A66C2]/10 flex items-center justify-center" title="LinkedIn">
              <span className="text-[#0A66C2] font-bold text-xs">in</span>
            </div>
            <div className="w-6 h-6 rounded bg-[#E1306C]/10 flex items-center justify-center" title="Instagram">
              <span className="text-[#E1306C] font-bold text-xs">IG</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs text-[#64748B]">
          <Calendar className="w-3 h-3" />
          {format(new Date(post.createdAt), "d MMM yyyy 'a las' HH:mm", { locale: es })}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        {canDelete && (
          <DeletePostButton postId={post.id} />
        )}

        <Link href={`/posts/${post.id}`} className="flex-1">
          <Button
            size="sm"
            className="w-full gap-1 text-xs text-white"
            style={{ backgroundColor: '#1B3A6B' }}
          >
            {post.status === 'DRAFT' ? 'Revisar y aprobar' :
             post.status === 'APPROVED' ? 'Ver y publicar' :
             post.status === 'REJECTED' ? 'Ver detalle' : 'Ver detalle'}
            <ArrowRight className="w-3 h-3" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
