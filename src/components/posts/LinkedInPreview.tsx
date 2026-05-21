import { ThumbsUp, MessageSquare, Repeat2, Send } from 'lucide-react'

interface LinkedInPreviewProps {
  text: string
}

function formatLinkedInText(text: string) {
  // Detectar URLs y convertirlas en spans azules
  const urlRegex = /(https?:\/\/[^\s]+)/g
  return text.split('\n').map((line, i) => (
    <span key={i}>
      {line.split(urlRegex).map((part, j) =>
        urlRegex.test(part) ? (
          <span key={j} className="text-[#0A66C2] hover:underline cursor-pointer">
            {part}
          </span>
        ) : (
          part
        )
      )}
      {'\n'}
    </span>
  ))
}

export function LinkedInPreview({ text }: LinkedInPreviewProps) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden shadow-sm">
      {/* Header de LinkedIn */}
      <div className="bg-[#F3F2EF] px-3 py-2 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[#EC6342]" />
          <div className="w-3 h-3 rounded-full bg-[#F5A623]" />
          <div className="w-3 h-3 rounded-full bg-[#57BB55]" />
          <span className="ml-2 text-xs text-[#64748B] font-medium">LinkedIn</span>
        </div>
      </div>

      <div className="p-4">
        {/* Perfil de empresa */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0 text-white font-bold text-sm"
            style={{ backgroundColor: '#1B3A6B' }}
          >
            I
          </div>
          <div>
            <p className="text-sm font-semibold text-[#000000E6] leading-tight">INGESEAM</p>
            <p className="text-xs text-[#00000099]">Consultoría Ambiental · Bogotá, Colombia</p>
            <p className="text-xs text-[#00000099]">Ahora · 🌐</p>
          </div>
        </div>

        {/* Texto del post */}
        <div className="text-sm text-[#000000E6] leading-relaxed whitespace-pre-wrap break-words min-h-[80px]">
          {text ? formatLinkedInText(text) : (
            <span className="text-[#64748B] italic">El texto del post aparecerá aquí...</span>
          )}
        </div>

        {/* Stats mock */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#E2E8F0] text-xs text-[#00000099]">
          <span className="flex items-center gap-1">
            <span className="text-base">👍</span>
            <span className="text-[#00000099]">24 · 8 comentarios</span>
          </span>
          <span>3 reposts</span>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-around mt-2 pt-2 border-t border-[#E2E8F0]">
          {[
            { icon: ThumbsUp, label: 'Recomendar' },
            { icon: MessageSquare, label: 'Comentar' },
            { icon: Repeat2, label: 'Repostear' },
            { icon: Send, label: 'Enviar' },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="flex items-center gap-1 text-xs text-[#00000099] hover:bg-[#F3F2EF] px-2 py-1 rounded transition-colors"
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
