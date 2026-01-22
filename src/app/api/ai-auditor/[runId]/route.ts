/**
 * AT5 AI Auditor - Run Detail API Routes
 *
 * Endpoints for managing individual AI audit runs.
 *
 * @module api/ai-auditor/[runId]
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { AIAuditRunStatus } from '@prisma/client'

const updateRunSchema = z.object({
  action: z.enum(['PAUSE', 'RESUME', 'CANCEL']),
})

interface RouteParams {
  params: Promise<{ runId: string }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'No autorizado' } },
        { status: 401 }
      )
    }

    const { runId } = await params

    const run = await prisma.aIAuditRun.findUnique({
      where: { id: runId },
      include: {
        session: {
          select: {
            id: true,
            name: true,
            status: true,
            testPlan: {
              select: {
                id: true,
                title: true,
              },
            },
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
        testExecutions: {
          orderBy: { sequenceNumber: 'asc' },
          select: {
            id: true,
            testCaseId: true,
            testCaseCode: true,
            sequenceNumber: true,
            status: true,
            verdict: true,
            confidence: true,
            currentStep: true,
            totalSteps: true,
            durationMs: true,
            mcpCallsCount: true,
            startedAt: true,
            completedAt: true,
          },
        },
        confirmationRequests: {
          where: { status: 'PENDING' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        logs: {
          orderBy: { timestamp: 'desc' },
          take: 50,
          select: {
            id: true,
            eventType: true,
            level: true,
            message: true,
            timestamp: true,
          },
        },
        supervisor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!run) {
      return NextResponse.json(
        { success: false, error: { code: 'RUN_NOT_FOUND', message: 'Ejecucion no encontrada' } },
        { status: 404 }
      )
    }

    const response = {
      id: run.id,
      runNumber: run.runNumber,
      status: run.status,
      mode: run.mode,
      session: {
        id: run.session.id,
        name: run.session.name,
        status: run.session.status,
        testPlan: run.session.testPlan,
      },
      config: run.config ? {
        id: run.config.id,
        name: run.config.name,
        provider: run.config.llmProvider,
        model: run.config.llmModel,
      } : null,
      progress: {
        total: run.totalTests,
        completed: run.completedTests,
        passed: run.passedTests,
        failed: run.failedTests,
        blocked: run.blockedTests,
        skipped: run.skippedTests,
        pending: run.totalTests - run.completedTests,
        percentComplete: run.totalTests > 0
          ? Math.round((run.completedTests / run.totalTests) * 100)
          : 0,
      },
      testExecutions: run.testExecutions.map(exec => ({
        id: exec.id,
        testCaseId: exec.testCaseId,
        testCaseCode: exec.testCaseCode,
        sequence: exec.sequenceNumber,
        status: exec.status,
        verdict: exec.verdict,
        confidence: exec.confidence,
        progress: {
          currentStep: exec.currentStep,
          totalSteps: exec.totalSteps,
        },
        durationMs: exec.durationMs,
        mcpCallsCount: exec.mcpCallsCount,
        startedAt: exec.startedAt,
        completedAt: exec.completedAt,
      })),
      pendingConfirmation: run.confirmationRequests[0] ? {
        id: run.confirmationRequests[0].id,
        type: run.confirmationRequests[0].type,
        action: run.confirmationRequests[0].action,
        context: run.confirmationRequests[0].context,
        expiresAt: run.confirmationRequests[0].expiresAt,
      } : null,
      recentLogs: run.logs,
      metrics: {
        totalDurationMs: run.totalDurationMs,
        avgTestDurationMs: run.completedTests > 0
          ? Math.round((run.totalDurationMs || 0) / run.completedTests)
          : 0,
        llmTokensUsed: run.llmTokensUsed,
        estimatedCost: Number(run.estimatedCost),
      },
      supervisor: run.supervisor,
      timestamps: {
        created: run.createdAt,
        started: run.startedAt,
        estimated: run.estimatedCompletionAt,
        completed: run.completedAt,
      },
    }

    return NextResponse.json({ success: true, data: response })

  } catch (error) {
    console.error('Error getting AI audit run:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Error al obtener la ejecucion' } },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'No autorizado' } },
        { status: 401 }
      )
    }

    const { runId } = await params
    const body = await request.json()

    const validation = updateRunSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Accion invalida' } },
        { status: 400 }
      )
    }

    const { action } = validation.data

    const run = await prisma.aIAuditRun.findUnique({
      where: { id: runId },
    })

    if (!run) {
      return NextResponse.json(
        { success: false, error: { code: 'RUN_NOT_FOUND', message: 'Ejecucion no encontrada' } },
        { status: 404 }
      )
    }

    const validTransitions: Record<string, AIAuditRunStatus[]> = {
      PAUSE: ['RUNNING', 'WAITING_CONFIRMATION'],
      RESUME: ['PAUSED'],
      CANCEL: ['PENDING', 'INITIALIZING', 'RUNNING', 'PAUSED', 'WAITING_CONFIRMATION'],
    }

    if (!validTransitions[action].includes(run.status)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_STATE', message: `No se puede ${action.toLowerCase()} en estado ${run.status}` } },
        { status: 400 }
      )
    }

    let newStatus: AIAuditRunStatus
    switch (action) {
      case 'PAUSE': newStatus = 'PAUSED'; break
      case 'RESUME': newStatus = 'RUNNING'; break
      case 'CANCEL': newStatus = 'CANCELLED'; break
      default: newStatus = run.status
    }

    const updatedRun = await prisma.aIAuditRun.update({
      where: { id: runId },
      data: {
        status: newStatus,
        ...(action === 'CANCEL' && { completedAt: new Date() }),
      },
    })

    await prisma.aIAuditLog.create({
      data: {
        runId,
        eventType: `RUN_${action}`,
        level: 'INFO',
        message: `Ejecucion ${action.toLowerCase()} por ${session.user.name}`,
        metadataJson: JSON.stringify({ userId: session.user.id, previousStatus: run.status, newStatus }),
      },
    })

    return NextResponse.json({
      success: true,
      data: { id: updatedRun.id, status: updatedRun.status, message: `Ejecucion ${action.toLowerCase()} exitosamente` },
    })

  } catch (error) {
    console.error('Error updating AI audit run:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Error al actualizar la ejecucion' } },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'No autorizado' } },
        { status: 401 }
      )
    }

    const { runId } = await params

    const run = await prisma.aIAuditRun.findUnique({ where: { id: runId } })

    if (!run) {
      return NextResponse.json(
        { success: false, error: { code: 'RUN_NOT_FOUND', message: 'Ejecucion no encontrada' } },
        { status: 404 }
      )
    }

    const completedStatuses: AIAuditRunStatus[] = ['COMPLETED', 'CANCELLED', 'FAILED', 'TIMEOUT']
    if (!completedStatuses.includes(run.status)) {
      return NextResponse.json(
        { success: false, error: { code: 'RUN_ACTIVE', message: 'No se puede eliminar una ejecucion activa' } },
        { status: 400 }
      )
    }

    await prisma.aIAuditRun.delete({ where: { id: runId } })

    return NextResponse.json({ success: true, data: { message: 'Ejecucion eliminada' } })

  } catch (error) {
    console.error('Error deleting AI audit run:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Error al eliminar la ejecucion' } },
      { status: 500 }
    )
  }
}
