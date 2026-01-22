import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/sessions/[id] - Obtener sesión por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const session = await prisma.auditSession.findUnique({
      where: { id },
      include: {
        auditor: true,
        testPlan: {
          include: {
            testSuites: {
              include: {
                testCases: true,
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
        executions: {
          include: {
            testCase: true,
            executedBy: true,
            evidences: true,
          },
        },
        signatures: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Sesión no encontrada' },
        { status: 404 }
      )
    }

    // Calcular estadísticas reales basadas en las ejecuciones
    const passedCount = session.executions.filter(e => e.status === 'PASSED').length
    const failedCount = session.executions.filter(e => e.status === 'FAILED').length
    const blockedCount = session.executions.filter(e => e.status === 'BLOCKED').length
    const skippedCount = session.executions.filter(e => e.status === 'SKIPPED').length
    const totalCount = session.testPlan?.testSuites.reduce(
      (acc, suite) => acc + suite.testCases.length, 0
    ) || 0
    const executedCount = passedCount + failedCount + blockedCount + skippedCount
    const progress = totalCount > 0 ? Math.round((executedCount / totalCount) * 100) : 0

    // Devolver sesión con estadísticas calculadas
    return NextResponse.json({
      ...session,
      passedCount,
      failedCount,
      blockedCount,
      skippedCount,
      totalCount,
      progress,
    })
  } catch (error) {
    console.error('Error fetching session:', error)
    return NextResponse.json(
      { error: 'Error al obtener la sesión' },
      { status: 500 }
    )
  }
}

// PATCH /api/sessions/[id] - Actualizar sesión
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const session = await prisma.auditSession.update({
      where: { id },
      data: body,
      include: {
        auditor: true,
        testPlan: true,
      },
    })

    // Crear log de auditoría
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_SESSION',
        entity: 'AuditSession',
        entityId: session.id,
        userId: session.auditorId,
        details: `Sesión actualizada: ${JSON.stringify(body)}`,
        ipAddress: '127.0.0.1',
      },
    })

    return NextResponse.json(session)
  } catch (error) {
    console.error('Error updating session:', error)
    return NextResponse.json(
      { error: 'Error al actualizar la sesión' },
      { status: 500 }
    )
  }
}

// DELETE /api/sessions/[id] - Eliminar sesión
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verificar que la sesión existe
    const session = await prisma.auditSession.findUnique({
      where: { id },
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Sesión no encontrada' },
        { status: 404 }
      )
    }

    // Solo permitir eliminar sesiones en estado DRAFT
    if (session.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Solo se pueden eliminar sesiones en estado borrador' },
        { status: 400 }
      )
    }

    await prisma.auditSession.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting session:', error)
    return NextResponse.json(
      { error: 'Error al eliminar la sesión' },
      { status: 500 }
    )
  }
}
