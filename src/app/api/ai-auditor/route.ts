/**
 * AT5 AI Auditor - REST API Routes
 *
 * Main API endpoints for the AI Auditor system.
 * Following REST best practices and ISO/IEC 29119-2 Test Process compliance.
 *
 * Endpoints:
 * - GET /api/ai-auditor - List AI audit runs
 * - POST /api/ai-auditor - Start a new AI audit run
 *
 * @module api/ai-auditor
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startAIAuditRunSchema } from '@/lib/ai-auditor/types'
import { createAIAuditorService } from '@/lib/ai-auditor/service'
import { AIAuditRunStatus } from '@prisma/client'

// ============================================================================
// GET /api/ai-auditor - List AI Audit Runs
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'No autorizado' } },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    // Build query filters
    const where: Record<string, unknown> = {}

    if (sessionId) {
      where.sessionId = sessionId
    }

    if (status) {
      where.status = status
    }

    // Execute query with pagination
    const [runs, total] = await Promise.all([
      prisma.aIAuditRun.findMany({
        where,
        include: {
          session: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
          config: {
            select: {
              id: true,
              name: true,
              llmProvider: true,
              llmModel: true,
            },
          },
          _count: {
            select: {
              testExecutions: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.aIAuditRun.count({ where }),
    ])

    // Format response
    const formattedRuns = runs.map(run => ({
      id: run.id,
      runNumber: run.runNumber,
      sessionId: run.sessionId,
      sessionName: run.session.name,
      status: run.status,
      mode: run.mode,
      progress: {
        total: run.totalTests,
        completed: run.completedTests,
        passed: run.passedTests,
        failed: run.failedTests,
        blocked: run.blockedTests,
        skipped: run.skippedTests,
        percentComplete: run.totalTests > 0
          ? Math.round((run.completedTests / run.totalTests) * 100)
          : 0,
      },
      config: run.config ? {
        id: run.config.id,
        name: run.config.name,
        provider: run.config.llmProvider,
        model: run.config.llmModel,
      } : null,
      metrics: {
        durationMs: run.totalDurationMs,
        tokensUsed: run.llmTokensUsed,
        estimatedCost: run.estimatedCost.toNumber(),
      },
      startedAt: run.startedAt,
      completedAt: run.completedAt,
      createdAt: run.createdAt,
    }))

    return NextResponse.json({
      success: true,
      data: formattedRuns,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    })

  } catch (error) {
    console.error('Error listing AI audit runs:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al obtener las ejecuciones de AI Auditor',
          details: error instanceof Error ? error.message : undefined,
        },
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST /api/ai-auditor - Start AI Audit Run
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'No autorizado' } },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = startAIAuditRunSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Datos de entrada inválidos',
            details: validation.error.errors,
          },
        },
        { status: 400 }
      )
    }

    const input = validation.data

    // Verify session exists and is in valid state
    const auditSession = await prisma.auditSession.findUnique({
      where: { id: input.sessionId },
      include: {
        testPlan: {
          include: {
            testSuites: {
              include: {
                _count: {
                  select: { testCases: true },
                },
              },
            },
          },
        },
      },
    })

    if (!auditSession) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SESSION_NOT_FOUND',
            message: 'Sesión de auditoría no encontrada',
          },
        },
        { status: 404 }
      )
    }

    // Check session status - cannot start AI run on completed/cancelled sessions
    const closedStatuses = ['APPROVED', 'REJECTED', 'ARCHIVED']
    if (closedStatuses.includes(auditSession.status)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SESSION_CLOSED',
            message: 'La sesión de auditoría ya está cerrada',
          },
        },
        { status: 400 }
      )
    }

    // Check if there's already an active AI run for this session
    const activeStatuses: AIAuditRunStatus[] = ['PENDING', 'INITIALIZING', 'RUNNING', 'PAUSED', 'WAITING_CONFIRMATION']
    const activeRun = await prisma.aIAuditRun.findFirst({
      where: {
        sessionId: input.sessionId,
        status: {
          in: activeStatuses,
        },
      },
    })

    if (activeRun) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RUN_ALREADY_ACTIVE',
            message: 'Ya existe una ejecución de AI Auditor activa para esta sesión',
            details: { runId: activeRun.id },
          },
        },
        { status: 409 }
      )
    }

    // Get or validate configuration
    let configId = input.configId

    if (!configId) {
      // Get default active configuration for the organization
      const defaultConfig = await prisma.aIAuditorConfig.findFirst({
        where: {
          organizationId: auditSession.testPlan.organizationId,
          isActive: true,
          isDefault: true,
        },
      })

      if (!defaultConfig) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'NO_CONFIG',
              message: 'No hay configuración de AI Auditor disponible',
            },
          },
          { status: 400 }
        )
      }

      configId = defaultConfig.id
    }

    // Create AI Auditor service and start run
    const service = await createAIAuditorService(configId)

    const runId = await service.startRun({
      sessionId: input.sessionId,
      mode: input.mode,
      testCaseIds: input.testCaseIds,
      configId,
      supervisorId: input.options?.supervisorId || session.user.id,
      stopOnCriticalFailure: input.options?.stopOnCriticalFailure,
    })

    // Get initial summary
    const summary = await service.getRunSummary(runId)

    return NextResponse.json({
      success: true,
      data: {
        runId,
        summary,
        message: 'AI Audit run iniciado exitosamente',
      },
    }, { status: 201 })

  } catch (error) {
    console.error('Error starting AI audit run:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al iniciar la ejecución de AI Auditor',
          details: error instanceof Error ? error.message : undefined,
        },
      },
      { status: 500 }
    )
  }
}
