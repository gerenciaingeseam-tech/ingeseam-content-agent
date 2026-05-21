import { db } from '@/lib/db'
import { PostCalendar } from '@/app/(dashboard)/calendar/components/PostCalendar'
import { startOfMonth, endOfMonth } from 'date-fns'

export const dynamic = 'force-dynamic'

export default async function CalendarPage() {
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const posts = await db.socialPost.findMany({
    where: {
      OR: [
        { scheduledFor: { gte: monthStart, lte: monthEnd } },
        { publishedAt: { gte: monthStart, lte: monthEnd } },
        { status: { in: ['DRAFT', 'APPROVED'] } },
      ],
    },
    include: { blogPost: { select: { title: true } } },
    orderBy: { createdAt: 'asc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#0F172A]">Calendario</h2>
        <p className="text-[#64748B] text-sm mt-1">Posts programados y publicados del mes</p>
      </div>
      <PostCalendar posts={posts} />
    </div>
  )
}
