import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createSignature, getSessionSignatures, checkRequiredSignatures } from '@/lib/signature'

// GET /api/signatures - Obtener firmas de una sesion
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId es requerido' },
        { status: 400 }
      )
    }

    const signatures = await getSessionSignatures(sessionId)
    const requirements = await checkRequiredSignatures(sessionId)

    return NextResponse.json({
      signatures,
      requirements,
    })
  } catch (error) {
    console.error('Error fetching signatures:', error)
    return NextResponse.json(
      { error: 'Error al obtener las firmas' },
      { status: 500 }
    )
  }
}

// POST /api/signatures - Crear una nueva firma
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo LEAD_AUDITOR, REVIEWER y ADMIN pueden firmar
    if (!['ADMIN', 'LEAD_AUDITOR', 'REVIEWER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Sin permisos para firmar sesiones' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { sessionId, signatureImage } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId es requerido' },
        { status: 400 }
      )
    }

    // Obtener IP y User Agent
    const ipAddress = request.headers.get('x-forwarded-for') ||
                      request.headers.get('x-real-ip') ||
                      '127.0.0.1'
    const userAgent = request.headers.get('user-agent') || undefined

    const signature = await createSignature({
      userId: session.user.id,
      sessionId,
      role: session.user.role,
      signatureImage,
      ipAddress,
      userAgent,
    })

    return NextResponse.json(signature, { status: 201 })
  } catch (error) {
    console.error('Error creating signature:', error)
    const message = error instanceof Error ? error.message : 'Error al crear la firma'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
