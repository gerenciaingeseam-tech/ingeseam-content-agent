import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { ExternalLink, Sparkles, Calendar } from 'lucide-react'
import type { BlogPost, PostStatus } from '@/types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface BlogCardProps {
  blog: BlogPost & { socialPosts: { status: PostStatus }[] }
}

export function BlogCard({ blog }: BlogCardProps) {
  const hasPublished = blog.socialPosts.some((p) => p.status === 'PUBLISHED')
  const hasDraft = blog.socialPosts.some(
    (p) => p.status === 'DRAFT' || p.status === 'APPROVED'
  )

  const statusLabel = hasPublished ? 'Publicado' : hasDraft ? 'Borrador listo' : 'Sin usar'
  const statusColor = hasPublished
    ? 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20'
    : hasDraft
    ? 'bg-[#D97706]/10 text-[#D97706] border-[#D97706]/20'
    : 'bg-[#64748B]/10 text-[#64748B] border-[#64748B]/20'

  return (
    <Card className="border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow flex flex-col">
      {/* Imagen destacada */}
      {blog.featuredImage && (
        <div className="h-36 overflow-hidden rounded-t-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={blog.featuredImage}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <CardContent className="flex-1 p-4 space-y-3">
        {/* Título */}
        <h3 className="font-semibold text-[#0F172A] text-sm leading-snug line-clamp-2">
          {blog.title}
        </h3>

        {/* Excerpt */}
        <p className="text-xs text-[#64748B] line-clamp-2">{blog.excerpt}</p>

        {/* Meta */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${statusColor}`}
          >
            {statusLabel}
          </span>

          {blog.categories.slice(0, 2).map((cat) => (
            <Badge
              key={cat}
              variant="secondary"
              className="text-xs bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]"
            >
              {cat}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-1 text-xs text-[#64748B]">
          <Calendar className="w-3 h-3" />
          {format(new Date(blog.wpPublishedAt), "d MMM yyyy", { locale: es })}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        {/* Ver en WordPress */}
        <Link
          href={blog.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-[#64748B] hover:text-[#1B3A6B] transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          Ver blog
        </Link>

        {/* Generar post — Server Action en la página */}
        <form action={`/api/generate`} method="POST" className="ml-auto">
          <input type="hidden" name="blogPostId" value={blog.id} />
          <Button
            type="submit"
            size="sm"
            className="text-xs h-7 px-3 text-white"
            style={{ backgroundColor: '#1A8F8A' }}
            disabled={hasPublished}
          >
            <Sparkles className="w-3 h-3 mr-1" />
            {hasPublished ? 'Ya publicado' : 'Generar post'}
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
