import { NextRequest, NextResponse } from 'next/server'
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
} from '@/lib/api-utils'
import { auditSessionBaseSchema } from '@/lib/validations'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit-log'

// Schema extendido para incluir selectedTestCases (usando base schema que es un ZodObject)
const sessionCreateRequestSchema = auditSessionBaseSchema.extend({
  selectedTestCases: z.array(z.string().uuid()).optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return data.endDate >= data.startDate
    }
    return true
  },
  {
    message: 'La fecha de fin debe ser posterior a la fecha de inicio',
    path: ['endDate'],
  }
)

// GET /api/sessions - Obtener todas las sesiones
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Construir filtros
    const where: Record<string, unknown> = {}

    if (status) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ]
    }

    // Si no es ADMIN o LEAD_AUDITOR, solo ver sus propias sesiones
    if (!['ADMIN', 'LEAD_AUDITOR', 'REVIEWER'].includes(user.role)) {
      where.auditorId = user.id
    }

    const [sessions, total] = await Promise.all([
      prisma.auditSession.findMany({
        where,
        include: {
          auditor: {
            select: { id: true, name: true, email: true },
          },
          testPlan: {
            select: { id: true, title: true },
          },
          _count: {
            select: { executions: true, signatures: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditSession.count({ where }),
    ])

    return successResponse({
      data: sessions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/sessions - Crear nueva sesión
export async function POST(request: NextRequest) {
  try {
    const user = await requirePermission('canManageSessions')
    const body = await parseJsonBody(request, sessionCreateRequestSchema)

    const { name, description, testPlanId, auditorId, selectedTestCases } = body

    // Obtener el test plan con sus casos
    const testPlan = await prisma.testPlan.findUnique({
      where: { id: testPlanId },
      include: {
        testSuites: {
          include: {
            testCases: true,
          },
        },
      },
    })

    if (!testPlan) {
      throw new NotFoundError('Plan de pruebas')
    }

    // Contar casos de prueba
    const allTestCases = testPlan.testSuites.flatMap(suite => suite.testCases)
    const totalCount = selectedTestCases?.length || allTestCases.length

    // Verificar auditor si se especifica
    if (auditorId) {
      const auditor = await prisma.user.findUnique({
        where: { id: auditorId },
      })
      if (!auditor) {
        throw new NotFoundError('Auditor')
      }
      if (!['ADMIN', 'LEAD_AUDITOR', 'AUDITOR'].includes(auditor.role)) {
        return NextResponse.json(
          { error: 'El usuario seleccionado no tiene rol de auditor' },
          { status: 400 }
        )
      }
    }

    // Crear la sesión
    const session = await prisma.auditSession.create({
      data: {
        name,
        description,
        status: 'DRAFT',
        startDate: body.startDate || new Date(),
        endDate: body.endDate,
        auditorId: auditorId || user.id,
        testPlanId,
        progress: 0,
        passedCount: 0,
        failedCount: 0,
        blockedCount: 0,
        skippedCount: 0,
        totalCount,
      },
      include: {
        auditor: {
          select: { id: true, name: true, email: true },
        },
        testPlan: {
          select: { id: true, title: true },
        },
      },
    })

    // Registrar en audit log
    await createAuditLog({
      action: AUDIT_ACTIONS.SESSION_CREATED,
      entity: 'AuditSession',
      entityId: session.id,
      userId: user.id,
      sessionId: session.id,
      details: `Sesión de auditoría creada: ${name}`,
    })

    return createdResponse(session)
  } catch (error) {
    return handleApiError(error)
  }
}
