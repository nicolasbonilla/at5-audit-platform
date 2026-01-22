import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { readFile, stat } from 'fs/promises'
import { join } from 'path'
import { lookup } from 'mime-types'

// GET /api/uploads/[...path] - Servir archivos subidos
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { path } = await params
    const filePath = join(process.cwd(), 'uploads', ...path)

    // Verificar que el archivo existe
    try {
      await stat(filePath)
    } catch {
      return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 })
    }

    // Leer el archivo
    const fileBuffer = await readFile(filePath)

    // Determinar el tipo MIME
    const fileName = path[path.length - 1]
    const mimeType = lookup(fileName) || 'application/octet-stream'

    // Devolver el archivo
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Content-Length': fileBuffer.length.toString(),
        'Content-Disposition': `inline; filename="${fileName}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Error serving file:', error)
    return NextResponse.json(
      { error: 'Error al servir el archivo' },
      { status: 500 }
    )
  }
}
