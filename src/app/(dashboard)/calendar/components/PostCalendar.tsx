'use client'

import Link from 'next/link'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isSameDay, isToday,
} from 'date-fns'
import { es } from 'date-fns/locale'
import type { SocialPost, PostStatus } from '@/types'

interface PostCalendarProps {
  posts: (SocialPost & { blogPost: { title: string } })[]
}

const statusColor: Record<PostStatus, string> = {
  DRAFT:     'bg-[#D97706] text-white',
  APPROVED:  'bg-[#1A8F8A] text-white',
  PUBLISHED: 'bg-[#16A34A] text-white',
  REJECTED:  'bg-[#DC2626] text-white',
}

function getPostDate(post: SocialPost): Date | null {
  if (post.publishedAt) return new Date(post.publishedAt)
  if (post.scheduledFor) return new Date(post.scheduledFor)
  if (post.status === 'DRAFT' || post.status === 'APPROVED') return new Date(post.createdAt)
  return null
}

export function PostCalendar({ posts }: PostCalendarProps) {
  const today = new Date()
  const monthStart = startOfMonth(today)
  const monthEnd = endOfMonth(today)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-lg shadow-sm overflow-hidden">
      {/* Header mes */}
      <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
        <h3 className="font-semibold text-[#0F172A] capitalize">
          {format(today, 'MMMM yyyy', { locale: es })}
        </h3>
        <div className="flex items-center gap-4 text-xs text-[#64748B]">
          {[
            { label: 'Borrador', color: 'bg-[#D97706]' },
            { label: 'Aprobado', color: 'bg-[#1A8F8A]' },
            { label: 'Publicado', color: 'bg-[#16A34A]' },
          ].map(({ label, color }) => (
            <span key={label} className="flex items-center gap-1">
              <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Grid días de la semana */}
      <div className="grid grid-cols-7 border-b border-[#E2E8F0]">
        {DAYS.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-medium text-[#64748B]">
            {d}
          </div>
        ))}
      </div>

      {/* Grid de días */}
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const inMonth = isSameMonth(day, today)
          const isCurrentDay = isToday(day)
          const dayPosts = posts.filter((p) => {
            const d = getPostDate(p)
            return d && isSameDay(d, day)
          })

          return (
            <div
              key={i}
              className={`min-h-[90px] p-1.5 border-b border-r border-[#E2E8F0] ${
                !inMonth ? 'bg-[#F8FAFC]' : 'bg-white'
              }`}
            >
              {/* Número del día */}
              <div className="flex justify-end mb-1">
                <span
                  className={`text-xs w-6 h-6 flex items-center justify-center rounded-full font-medium ${
                    isCurrentDay
                      ? 'bg-[#1B3A6B] text-white'
                      : inMonth
                      ? 'text-[#0F172A]'
                      : 'text-[#CBD5E1]'
                  }`}
                >
                  {format(day, 'd')}
                </span>
              </div>

              {/* Posts del día */}
              <div className="space-y-0.5">
                {dayPosts.slice(0, 2).map((post) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.id}`}
                    className={`block text-xs px-1.5 py-0.5 rounded truncate ${statusColor[post.status]} hover:opacity-80 transition-opacity`}
                    title={post.blogPost.title}
                  >
                    {post.blogPost.title.slice(0, 20)}…
                  </Link>
                ))}
                {dayPosts.length > 2 && (
                  <p className="text-xs text-[#64748B] px-1">+{dayPosts.length - 2} más</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
