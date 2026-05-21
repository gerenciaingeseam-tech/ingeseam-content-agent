import type { PostStatus } from '@/types'

const config: Record<PostStatus, { label: string; className: string }> = {
  DRAFT: {
    label: 'Borrador',
    className: 'bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/20',
  },
  APPROVED: {
    label: 'Aprobado',
    className: 'bg-[#1A8F8A]/10 text-[#1A8F8A] border border-[#1A8F8A]/20',
  },
  PUBLISHED: {
    label: 'Publicado',
    className: 'bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/20',
  },
  REJECTED: {
    label: 'Rechazado',
    className: 'bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/20',
  },
}

export function StatusBadge({ status }: { status: PostStatus }) {
  const { label, className } = config[status]
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${className}`}>
      {label}
    </span>
  )
}
