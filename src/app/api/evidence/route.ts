import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createHash } from 'crypto'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit-log'

// GET /api/evidence - Obtener evidencias
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const executionId = searchParams.get('executionId')
    const sessionId = searchParams.get('sessionId')

    const where: Record<string, unknown> = {}

    if (executionId) {
      where.executionId = executionId
    }

    if (sessionId) {
      where.execution = {
        sessionId: sessionId,
      }
    }

    const evidences = await prisma.evidence.findMany({
      where,
      include: {
        execution: {
          include: {
            testCase: {
              select: {
                code: true,
                name: true,
              },
            },
            session: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    })

    return NextResponse.json(evidences)
  } catch (error) {
    console.error('Error fetching evidence:', error)
    return NextResponse.json(
      { error: 'Error al obtener las evidencias' },
      { status: 500 }
    )
  }
}

// POST /api/evidence - Subir nueva evidencia
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo ADMIN, LEAD_AUDITOR y AUDITOR pueden subir evidencias
    if (!['ADMIN', 'LEAD_AUDITOR', 'AUDITOR'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Sin permisos para subir evidencias' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const executionId = formData.get('executionId') as string
    const description = formData.get('description') as string | null
    const type = formData.get('type') as string | null

    if (!file || !executionId) {
      return NextResponse.json(
        { error: 'Archivo y executionId son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que la ejecucion existe
    const execution = await prisma.testExecution.findUnique({
      where: { id: executionId },
      include: {
        session: true,
        testCase: { select: { code: true, name: true } },
      },
    })

    if (!execution) {
      return NextResponse.json(
        { error: 'Ejecucion no encontrada' },
        { status: 404 }
      )
    }

    // Crear directorio si no existe
    const uploadDir = join(process.cwd(), 'uploads', 'evidence', executionId)
    await mkdir(uploadDir, { recursive: true })

    // Generar nombre de archivo unico
    const timestamp = Date.now()
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${timestamp}_${safeFileName}`
    const filePath = join(uploadDir, fileName)

    // Leer contenido del archivo
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Calcular hash SHA-256
    const hash = createHash('sha256').update(buffer).digest('hex')

    // Guardar archivo
    await writeFile(filePath, buffer)

    // Determinar tipo de evidencia
    let evidenceType = type || 'OTHER'
    if (!type) {
      const mimeType = file.type
      if (mimeType.startsWith('image/')) {
        evidenceType = 'SCREENSHOT'
      } else if (mimeType === 'application/pdf') {
        evidenceType = 'PDF'
      } else if (mimeType.startsWith('video/')) {
        evidenceType = 'VIDEO'
      } else if (mimeType === 'application/json') {
        evidenceType = 'JSON'
      } else if (mimeType.startsWith('text/')) {
        evidenceType = 'LOG'
      }
    }

    // Crear registro en la base de datos
    const evidence = await prisma.evidence.create({
      data: {
        type: evidenceType as 'SCREENSHOT' | 'LOG' | 'PDF' | 'VIDEO' | 'JSON' | 'OTHER',
        fileName: file.name,
        filePath: `/uploads/evidence/${executionId}/${fileName}`,
        fileSize: buffer.length,
        mimeType: file.type,
        hash,
        description: description || undefined,
        executionId,
      },
      include: {
        execution: {
          include: {
            testCase: {
              select: {
                code: true,
                name: true,
              },
            },
          },
        },
      },
    })

    // Registrar en audit log
    await createAuditLog({
      action: AUDIT_ACTIONS.EVIDENCE_UPLOADED,
      entity: 'Evidence',
      entityId: evidence.id,
      userId: session.user.id,
      sessionId: execution.sessionId,
      details: `Evidencia "${file.name}" subida para ${execution.testCase?.code || 'prueba'}`,
      newValue: {
        fileName: file.name,
        fileSize: buffer.length,
        type: evidenceType,
        hash,
      },
    })

    return NextResponse.json(evidence, { status: 201 })
  } catch (error) {
    console.error('Error uploading evidence:', error)
    return NextResponse.json(
      { error: 'Error al subir la evidencia' },
      { status: 500 }
    )
  }
}
