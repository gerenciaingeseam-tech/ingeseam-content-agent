interface StatsCardProps {
  label: string
  value: number
  color: string
  description?: string
}

export function StatsCard({ label, value, color, description }: StatsCardProps) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-lg p-5 shadow-sm">
      <p className="text-sm text-[#64748B]">{label}</p>
      <p className="text-3xl font-bold mt-1" style={{ color }}>
        {value}
      </p>
      {description && (
        <p className="text-xs text-[#64748B] mt-1">{description}</p>
      )}
    </div>
  )
}
