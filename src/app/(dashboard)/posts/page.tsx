import { db } from '@/lib/db'
import { PostCard } from '@/components/posts/PostCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { PostStatus } from '@/types'

export const dynamic = 'force-dynamic'

const TABS: { value: PostStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'DRAFT', label: 'Borradores' },
  { value: 'APPROVED', label: 'Aprobados' },
  { value: 'PUBLISHED', label: 'Publicados' },
  { value: 'REJECTED', label: 'Rechazados' },
]

export default async function PostsPage() {
  const posts = await db.socialPost.findMany({
    orderBy: { createdAt: 'desc' },
    include: { blogPost: true },
  })

  type PostItem = (typeof posts)[number]

  const counts: Record<PostStatus | 'ALL', number> = {
    ALL: posts.length,
    DRAFT: posts.filter((p: PostItem) => p.status === 'DRAFT').length,
    APPROVED: posts.filter((p: PostItem) => p.status === 'APPROVED').length,
    PUBLISHED: posts.filter((p: PostItem) => p.status === 'PUBLISHED').length,
    REJECTED: posts.filter((p: PostItem) => p.status === 'REJECTED').length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#0F172A]">Posts</h2>
        <p className="text-[#64748B] text-sm mt-1">
          Todos los borradores y publicaciones generados
        </p>
      </div>

      <Tabs defaultValue="ALL">
        <TabsList className="bg-white border border-[#E2E8F0]">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="data-[state=active]:bg-[#1B3A6B] data-[state=active]:text-white text-sm"
            >
              {tab.label}
              <span className="ml-1.5 text-xs opacity-70">({counts[tab.value]})</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((tab) => {
          const filtered: PostItem[] =
            tab.value === 'ALL'
              ? posts
              : posts.filter((p: PostItem) => p.status === tab.value)

          return (
            <TabsContent key={tab.value} value={tab.value} className="mt-4">
              {filtered.length === 0 ? (
                <div className="bg-white border border-[#E2E8F0] rounded-lg p-10 text-center">
                  <p className="text-[#64748B] text-sm">No hay posts en esta categoría.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map((post: PostItem) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
