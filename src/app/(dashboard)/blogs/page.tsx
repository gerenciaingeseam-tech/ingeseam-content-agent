import { db } from '@/lib/db'
import { BlogCard } from '@/components/blogs/BlogCard'
import { SyncBlogsButton } from '@/app/(dashboard)/blogs/components/SyncBlogsButton'
import { BookOpen } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function BlogsPage() {
  const blogs = await db.blogPost.findMany({
    orderBy: { wpPublishedAt: 'desc' },
    include: {
      socialPosts: {
        select: { status: true },
      },
    },
  })

  const published = blogs.filter((b) =>
    b.socialPosts.some((p) => p.status === 'PUBLISHED')
  ).length
  const withDraft = blogs.filter((b) =>
    b.socialPosts.some((p) => p.status === 'DRAFT' || p.status === 'APPROVED')
  ).length
  const unused = blogs.filter((b) => b.socialPosts.length === 0).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A]">Biblioteca de Blogs</h2>
          <p className="text-[#64748B] text-sm mt-1">
            Blogs sincronizados desde{' '}
            <span className="font-medium">ingeseam.com</span>
          </p>
        </div>
        <SyncBlogsButton />
      </div>

      {/* Stats rápidas */}
      <div className="flex gap-4 flex-wrap">
        {[
          { label: 'Total blogs', value: blogs.length, color: '#1B3A6B' },
          { label: 'Publicados en RRSS', value: published, color: '#16A34A' },
          { label: 'Con borrador', value: withDraft, color: '#D97706' },
          { label: 'Sin usar', value: unused, color: '#64748B' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-[#E2E8F0] rounded-lg px-4 py-3 shadow-sm flex items-center gap-3"
          >
            <span
              className="text-2xl font-bold"
              style={{ color: stat.color }}
            >
              {stat.value}
            </span>
            <span className="text-xs text-[#64748B]">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Grid de blogs */}
      {blogs.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-lg p-12 text-center shadow-sm">
          <BookOpen className="w-10 h-10 text-[#64748B] mx-auto mb-3 opacity-40" />
          <p className="text-[#0F172A] font-medium">No hay blogs sincronizados</p>
          <p className="text-[#64748B] text-sm mt-1">
            Haz clic en &quot;Sincronizar Blogs&quot; para importar los posts de ingeseam.com
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      )}
    </div>
  )
}
