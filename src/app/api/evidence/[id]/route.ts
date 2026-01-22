import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit-log'

// GET /api/evidence/[id] - Obtener una evidencia por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    const evidence = await prisma.evidence.findUnique({
      where: { id },
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
            executedBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    if (!evidence) {
      return NextResponse.json({ error: 'Evidencia no encontrada' }, { status: 404 })
    }

    return NextResponse.json(evidence)
  } catch (error) {
    console.error('Error fetching evidence:', error)
    return NextResponse.json(
      { error: 'Error al obtener la evidencia' },
      { status: 500 }
    )
  }
}

// DELETE /api/evidence/[id] - Eliminar una evidencia
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo ADMIN y LEAD_AUDITOR pueden eliminar evidencias
    if (!['ADMIN', 'LEAD_AUDITOR'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Sin permisos para eliminar evidencias' },
        { status: 403 }
      )
    }

    const { id } = await params

    const evidence = await prisma.evidence.findUnique({
      where: { id },
      include: {
        execution: {
          include: {
            session: true,
          },
        },
      },
    })

    if (!evidence) {
      return NextResponse.json({ error: 'Evidencia no encontrada' }, { status: 404 })
    }

    // Intentar eliminar el archivo fisico
    try {
      const fullPath = join(process.cwd(), evidence.filePath)
      await unlink(fullPath)
    } catch {
      // Si no se puede eliminar el archivo, continuar (puede que ya no exista)
      console.warn(`No se pudo eliminar el archivo: ${evidence.filePath}`)
    }

    // Eliminar de la base de datos
    await prisma.evidence.delete({
      where: { id },
    })

    // Registrar en audit log
    await createAuditLog({
      action: AUDIT_ACTIONS.EVIDENCE_DELETED,
      entity: 'Evidence',
      entityId: id,
      userId: session.user.id,
      sessionId: evidence.execution.sessionId,
      details: `Evidencia "${evidence.fileName}" eliminada`,
      oldValue: {
        fileName: evidence.fileName,
        fileSize: evidence.fileSize,
        type: evidence.type,
        hash: evidence.hash,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting evidence:', error)
    return NextResponse.json(
      { error: 'Error al eliminar la evidencia' },
      { status: 500 }
    )
  }
}

// PATCH /api/evidence/[id] - Actualizar descripcion de evidencia
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { description } = body

    const evidence = await prisma.evidence.findUnique({
      where: { id },
    })

    if (!evidence) {
      return NextResponse.json({ error: 'Evidencia no encontrada' }, { status: 404 })
    }

    const updated = await prisma.evidence.update({
      where: { id },
      data: {
        description,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating evidence:', error)
    return NextResponse.json(
      { error: 'Error al actualizar la evidencia' },
      { status: 500 }
    )
  }
}
