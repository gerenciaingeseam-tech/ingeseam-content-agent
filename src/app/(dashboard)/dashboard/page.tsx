import { db } from '@/lib/db'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { PendingPostsList } from '@/components/dashboard/PendingPostsList'
import { GenerateNowButton } from '@/app/(dashboard)/dashboard/components/GenerateNowButton'
import { startOfWeek, startOfMonth } from 'date-fns'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const now = new Date()
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const monthStart = startOfMonth(now)

  const [drafts, approvedThisWeek, publishedThisMonth, rejected, pendingPosts] =
    await Promise.all([
      db.socialPost.count({ where: { status: 'DRAFT' } }),
      db.socialPost.count({
        where: { status: 'APPROVED', createdAt: { gte: weekStart } },
      }),
      db.socialPost.count({
        where: { status: 'PUBLISHED', publishedAt: { gte: monthStart } },
      }),
      db.socialPost.count({ where: { status: 'REJECTED' } }),
      db.socialPost.findMany({
        where: { status: 'DRAFT' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { blogPost: true },
      }),
    ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A]">Dashboard</h2>
          <p className="text-[#64748B] text-sm mt-1">
            Panel de contenido INGESEAM — LinkedIn & Instagram
          </p>
        </div>
        <GenerateNowButton />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Borradores pendientes"
          value={drafts}
          color="#D97706"
          description="Esperando revisión"
        />
        <StatsCard
          label="Aprobados esta semana"
          value={approvedThisWeek}
          color="#1A8F8A"
          description="Listos para publicar"
        />
        <StatsCard
          label="Publicados este mes"
          value={publishedThisMonth}
          color="#16A34A"
          description="En LinkedIn e Instagram"
        />
        <StatsCard
          label="Rechazados"
          value={rejected}
          color="#DC2626"
          description="Total acumulado"
        />
      </div>

      {/* Pending posts */}
      <div>
        <h3 className="text-base font-semibold text-[#0F172A] mb-3">
          Borradores pendientes de revisión
        </h3>
        <PendingPostsList posts={pendingPosts} />
      </div>
    </div>
  )
}
