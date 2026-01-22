/**
 * AT5 AI Auditor - Confirmations API
 *
 * Endpoints for managing human-in-the-loop confirmations.
 *
 * Endpoints:
 * - GET /api/ai-auditor/[runId]/confirmations - List pending confirmations
 * - POST /api/ai-auditor/[runId]/confirmations - Submit confirmation response
 *
 * @module api/ai-auditor/[runId]/confirmations
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { confirmationResponseSchema } from '@/lib/ai-auditor/types'
import { ConfirmationStatus } from '@prisma/client'

interface RouteParams {
  params: Promise<{ runId: string }>
}

// ============================================================================
// GET /api/ai-auditor/[runId]/confirmations - List Confirmations
// ============================================================================

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
    const { searchParams } = new URL(request.url)
    const statusParam = searchParams.get('status') || 'PENDING'

    // Verify run exists
    const run = await prisma.aIAuditRun.findUnique({
      where: { id: runId },
    })

    if (!run) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RUN_NOT_FOUND',
            message: 'Ejecución de AI Auditor no encontrada',
          },
        },
        { status: 404 }
      )
    }

    // Build where clause
    const whereClause: { runId: string; status?: ConfirmationStatus } = { runId }
    if (statusParam !== 'ALL') {
      whereClause.status = statusParam as ConfirmationStatus
    }

    // Get confirmations
    const confirmations = await prisma.aIConfirmationRequest.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Get respondedBy users separately if needed
    const respondedByIds = confirmations
      .map(c => c.respondedById)
      .filter((id): id is string => id !== null)

    const respondedByUsers = respondedByIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: respondedByIds } },
          select: { id: true, name: true, email: true },
        })
      : []

    const userMap = new Map(respondedByUsers.map(u => [u.id, u]))

    const formattedConfirmations = confirmations.map(conf => ({
      id: conf.id,
      type: conf.type,
      status: conf.status,
      action: conf.action,
      context: conf.context,
      aiExplanation: conf.aiExplanation,
      parameters: JSON.parse(conf.parametersJson),
      testExecutionId: conf.testExecutionId,
      response: conf.response,
      respondedBy: conf.respondedById ? userMap.get(conf.respondedById) : null,
      respondedAt: conf.respondedAt,
      notes: conf.notes,
      expiresAt: conf.expiresAt,
      createdAt: conf.createdAt,
      isExpired: conf.status === 'PENDING' && new Date() > conf.expiresAt,
    }))

    return NextResponse.json({
      success: true,
      data: formattedConfirmations,
    })

  } catch (error) {
    console.error('Error listing confirmations:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al obtener las confirmaciones',
          details: error instanceof Error ? error.message : undefined,
        },
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST /api/ai-auditor/[runId]/confirmations - Submit Confirmation
// ============================================================================

export async function POST(
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

    // Validate input
    const validation = confirmationResponseSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Datos de respuesta inválidos',
            details: validation.error.errors,
          },
        },
        { status: 400 }
      )
    }

    const { requestId, response, notes } = validation.data

    // Get the confirmation request
    const confirmationRequest = await prisma.aIConfirmationRequest.findUnique({
      where: { id: requestId },
      include: {
        run: true,
      },
    })

    if (!confirmationRequest) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CONFIRMATION_NOT_FOUND',
            message: 'Solicitud de confirmación no encontrada',
          },
        },
        { status: 404 }
      )
    }

    // Verify it belongs to the specified run
    if (confirmationRequest.runId !== runId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CONFIRMATION_MISMATCH',
            message: 'La confirmación no pertenece a esta ejecución',
          },
        },
        { status: 400 }
      )
    }

    // Check if already responded
    if (confirmationRequest.status !== 'PENDING') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CONFIRMATION_ALREADY_HANDLED',
            message: `La confirmación ya fue respondida: ${confirmationRequest.response}`,
          },
        },
        { status: 400 }
      )
    }

    // Check if expired
    if (new Date() > confirmationRequest.expiresAt) {
      await prisma.aIConfirmationRequest.update({
        where: { id: requestId },
        data: { status: 'EXPIRED' },
      })

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CONFIRMATION_EXPIRED',
            message: 'La solicitud de confirmación ha expirado',
          },
        },
        { status: 400 }
      )
    }

    // Map the response to the ConfirmationStatus enum
    const statusMap: Record<string, 'APPROVED' | 'REJECTED'> = {
      APPROVE: 'APPROVED',
      REJECT: 'REJECTED',
      SKIP: 'REJECTED',
      RETRY: 'APPROVED',
      MANUAL: 'REJECTED',
    }

    // Update confirmation
    const updatedConfirmation = await prisma.aIConfirmationRequest.update({
      where: { id: requestId },
      data: {
        status: statusMap[response] || 'APPROVED',
        response,
        notes,
        respondedById: session.user.id,
        respondedAt: new Date(),
      },
    })

    // Update run status if it was waiting for confirmation
    if (confirmationRequest.run.status === 'WAITING_CONFIRMATION') {
      await prisma.aIAuditRun.update({
        where: { id: runId },
        data: {
          status: 'RUNNING',
          pendingConfirmationId: null,
        },
      })
    }

    // Log the response
    await prisma.aIAuditLog.create({
      data: {
        runId,
        testExecutionId: confirmationRequest.testExecutionId,
        eventType: 'CONFIRMATION_RESPONSE',
        level: 'INFO',
        message: `Confirmación respondida: ${response} por ${session.user.name}`,
        metadataJson: JSON.stringify({
          confirmationId: requestId,
          response,
          notes,
          userId: session.user.id,
        }),
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updatedConfirmation.id,
        status: updatedConfirmation.status,
        response: updatedConfirmation.response,
        message: 'Confirmación procesada exitosamente',
      },
    })

  } catch (error) {
    console.error('Error submitting confirmation:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al procesar la confirmación',
          details: error instanceof Error ? error.message : undefined,
        },
      },
      { status: 500 }
    )
  }
}
