import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react'

interface InstagramPreviewProps {
  text: string
  hashtags: string[]
  featuredImage?: string | null
}

export function InstagramPreview({ text, hashtags, featuredImage }: InstagramPreviewProps) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden shadow-sm max-w-sm mx-auto">
      {/* Header Instagram */}
      <div className="bg-white px-3 py-2 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-[#EC6342]" />
          <div className="w-3 h-3 rounded-full bg-[#F5A623]" />
          <div className="w-3 h-3 rounded-full bg-[#57BB55]" />
          <span className="ml-2 text-xs text-[#64748B] font-medium">Instagram</span>
        </div>
      </div>

      {/* Post header */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
            style={{
              background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
            }}
          >
            I
          </div>
          <div>
            <p className="text-xs font-semibold text-[#000000] leading-tight">ingeseam_ambiental</p>
            <p className="text-xs text-[#737373]">Bogotá, Colombia</p>
          </div>
        </div>
        <MoreHorizontal className="w-5 h-5 text-[#262626]" />
      </div>

      {/* Imagen */}
      {featuredImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={featuredImage}
          alt="Imagen del blog"
          className="w-full aspect-square object-cover"
        />
      ) : (
        <div
          className="w-full aspect-square flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #1B3A6B 0%, #1A8F8A 100%)' }}
        >
          <div className="text-center text-white">
            <p className="font-bold text-xl">INGESEAM</p>
            <p className="text-xs opacity-80 mt-1">Consultoría Ambiental</p>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex gap-3">
          <Heart className="w-6 h-6 text-[#262626]" />
          <MessageCircle className="w-6 h-6 text-[#262626]" />
          <Send className="w-6 h-6 text-[#262626]" />
        </div>
        <Bookmark className="w-6 h-6 text-[#262626]" />
      </div>

      {/* Likes */}
      <p className="px-3 text-xs font-semibold text-[#262626] pb-1">142 Me gusta</p>

      {/* Caption */}
      <div className="px-3 pb-2">
        <p className="text-xs text-[#262626] leading-relaxed">
          <span className="font-semibold mr-1">ingeseam_ambiental</span>
          <span className="whitespace-pre-wrap break-words">
            {text || <span className="text-[#737373] italic">La caption aparecerá aquí...</span>}
          </span>
        </p>

        {/* Hashtags */}
        {hashtags.length > 0 && (
          <p className="text-xs text-[#0095F6] mt-1 leading-relaxed">
            {hashtags.join(' ')}
          </p>
        )}
      </div>

      {/* Timestamp */}
      <p className="px-3 pb-3 text-xs text-[#737373] uppercase tracking-wide">Hace 2 horas</p>
    </div>
  )
}
