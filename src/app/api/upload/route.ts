import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createClient } from '@supabase/supabase-js'
import { db } from '@/lib/db'

// Cliente con service role para Supabase Storage
function getStorageClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const BUCKET = 'post-images'

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const postId = formData.get('postId') as string | null

  if (!file || !postId) {
    return NextResponse.json({ error: 'Se requiere file y postId' }, { status: 400 })
  }

  // Validar tipo de archivo
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: 'Solo se permiten imágenes JPG, PNG, WebP o GIF' }, { status: 400 })
  }

  // Validar tamaño (máx 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'La imagen no puede superar 5MB' }, { status: 400 })
  }

  const storage = getStorageClient()

  // Crear bucket si no existe
  const { data: buckets } = await storage.storage.listBuckets()
  if (!buckets?.find(b => b.name === BUCKET)) {
    await storage.storage.createBucket(BUCKET, { public: true })
  }

  // Subir archivo
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${postId}/custom-${Date.now()}.${ext}`
  const buffer = await file.arrayBuffer()

  const { error: uploadError } = await storage.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  // Obtener URL pública
  const { data: urlData } = storage.storage.from(BUCKET).getPublicUrl(path)
  const publicUrl = urlData.publicUrl

  // Guardar en la BD
  await db.socialPost.update({
    where: { id: postId },
    data: { customImageUrl: publicUrl },
  })

  return NextResponse.json({ data: { url: publicUrl } })
}
