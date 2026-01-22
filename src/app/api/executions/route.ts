import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import {
  handleApiError,
  requireAuth,
  requirePermission,
  parseJsonBody,
  successResponse,
  createdResponse,
  NotFoundError,
  ApiError,
} from '@/lib/api-utils'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit-log'

// Schema de validación para crear/actualizar ejecución
const executionRequestSchema = z.object({
  sessionId: z.string().uuid('ID de sesión inválido'),
  testCaseId: z.string().uuid('ID de caso de prueba inválido'),
  executorId: z.string().uuid('ID de ejecutor inválido').optional(),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'PASSED', 'FAILED', 'BLOCKED', 'SKIPPED'], {
    errorMap: () => ({ message: 'Estado de ejecución inválido' }),
  }),
  actualResult: z
    .string()
    .max(5000, 'El resultado actual no puede exceder 5000 caracteres')
    .optional(),
  notes: z
    .string()
    .max(2000, 'Las notas no pueden exceder 2000 caracteres')
    .optional(),
  duration: z.number().int().min(0).optional(),
})

// POST /api/executions - Crear nueva ejecución de caso de prueba
export async function POST(request: NextRequest) {
  try {
    const user = await requirePermission('canExecuteTests')
    const body = await parseJsonBody(request, executionRequestSchema)

    const { sessionId, testCaseId, status, actualResult, notes, duration } = body
    const executorId = body.executorId || user.id

    // Verificar que la sesión existe
    const session = await prisma.auditSession.findUnique({
      where: { id: sessionId },
    })

    if (!session) {
      throw new NotFoundError('Sesión')
    }

    // Verificar que el caso de prueba existe
    const testCase = await prisma.testCase.findUnique({
      where: { id: testCaseId },
    })

    if (!testCase) {
      throw new NotFoundError('Caso de prueba')
    }

    // Si la sesión está en DRAFT, cambiarla a IN_PROGRESS automáticamente
    if (session.status === 'DRAFT') {
      await prisma.auditSession.update({
        where: { id: sessionId },
        data: { status: 'IN_PROGRESS' },
      })
    } else if (!['IN_PROGRESS', 'REVIEW'].includes(session.status)) {
      throw new ApiError('La sesión no permite ejecución de pruebas en su estado actual', 400)
    }

    // Verificar si ya existe una ejecución para este caso en esta sesión
    const existingExecution = await prisma.testExecution.findFirst({
      where: {
        sessionId,
        testCaseId,
      },
    })

    let execution

    if (existingExecution) {
      // Actualizar la ejecución existente
      execution = await prisma.testExecution.update({
        where: { id: existingExecution.id },
        data: {
          status,
          actualResult,
          comments: notes,
          duration,
          endTime: new Date(),
        },
        include: {
          testCase: true,
          executedBy: {
            select: { id: true, name: true, email: true },
          },
        },
      })

      // Registrar actualización
      await createAuditLog({
        action: AUDIT_ACTIONS.EXECUTION_UPDATED,
        entity: 'TestExecution',
        entityId: execution.id,
        userId: user.id,
        sessionId,
        details: `Caso ${testCase.code} actualizado: ${status}`,
        oldValue: { status: existingExecution.status },
        newValue: { status },
      })
    } else {
      // Crear nueva ejecución
      execution = await prisma.testExecution.create({
        data: {
          sessionId,
          testCaseId,
          executedById: executorId,
          status,
          actualResult,
          comments: notes,
          duration,
          startTime: new Date(),
          endTime: new Date(),
        },
        include: {
          testCase: true,
          executedBy: {
            select: { id: true, name: true, email: true },
          },
        },
      })

      // Registrar creación
      await createAuditLog({
        action: AUDIT_ACTIONS.TEST_EXECUTED,
        entity: 'TestExecution',
        entityId: execution.id,
        userId: user.id,
        sessionId,
        details: `Caso ${testCase.code} ejecutado: ${status}`,
      })
    }

    // Actualizar contadores de la sesión
    const allExecutions = await prisma.testExecution.findMany({
      where: { sessionId },
    })

    const passedCount = allExecutions.filter(e => e.status === 'PASSED').length
    const failedCount = allExecutions.filter(e => e.status === 'FAILED').length
    const blockedCount = allExecutions.filter(e => e.status === 'BLOCKED').length
    const skippedCount = allExecutions.filter(e => e.status === 'SKIPPED').length
    const totalExecuted = passedCount + failedCount + blockedCount + skippedCount
    const progress = session.totalCount > 0
      ? Math.round((totalExecuted / session.totalCount) * 100)
      : 0

    await prisma.auditSession.update({
      where: { id: sessionId },
      data: {
        passedCount,
        failedCount,
        blockedCount,
        skippedCount,
        progress,
      },
    })

    return createdResponse(execution)
  } catch (error) {
    return handleApiError(error)
  }
}

// GET /api/executions - Obtener ejecuciones (con filtros)
export async function GET(request: NextRequest) {
  try {
    await requireAuth()

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const testCaseId = searchParams.get('testCaseId')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}

    if (sessionId) {
      // Validar UUID
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId)) {
        throw new ApiError('ID de sesión inválido', 400)
      }
      where.sessionId = sessionId
    }
    if (testCaseId) {
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(testCaseId)) {
        throw new ApiError('ID de caso de prueba inválido', 400)
      }
      where.testCaseId = testCaseId
    }
    if (status) {
      const validStatuses = ['NOT_STARTED', 'IN_PROGRESS', 'PASSED', 'FAILED', 'BLOCKED', 'SKIPPED']
      if (!validStatuses.includes(status)) {
        throw new ApiError('Estado inválido', 400)
      }
      where.status = status
    }

    const executions = await prisma.testExecution.findMany({
      where,
      include: {
        testCase: {
          select: { id: true, code: true, name: true, priority: true },
        },
        executedBy: {
          select: { id: true, name: true, email: true },
        },
        evidences: {
          select: { id: true, type: true, fileName: true, uploadedAt: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return successResponse(executions)
  } catch (error) {
    return handleApiError(error)
  }
}
