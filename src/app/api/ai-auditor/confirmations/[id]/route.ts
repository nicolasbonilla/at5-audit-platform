/**
 * AT5 AI Auditor - Single Confirmation API
 *
 * Endpoints for responding to a specific confirmation.
 *
 * Endpoints:
 * - POST /api/ai-auditor/confirmations/[id] - Respond to confirmation
 *
 * @module api/ai-auditor/confirmations/[id]
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// ============================================================================
// POST /api/ai-auditor/confirmations/[id] - Respond to Confirmation
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

    const { id } = await params
    const body = await request.json()
    const { response, notes } = body

    if (!response || !['APPROVE', 'REJECT', 'MANUAL'].includes(response)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Respuesta inválida. Debe ser APPROVE, REJECT o MANUAL',
          },
        },
        { status: 400 }
      )
    }

    // Get the confirmation request
    const confirmationRequest = await prisma.aIConfirmationRequest.findUnique({
      where: { id },
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
        where: { id },
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
      MANUAL: 'REJECTED',
    }

    // Update confirmation
    const updatedConfirmation = await prisma.aIConfirmationRequest.update({
      where: { id },
      data: {
        status: statusMap[response] || 'APPROVED',
        response,
        notes: notes || null,
        respondedById: session.user.id,
        respondedAt: new Date(),
      },
    })

    // Update run status if it was waiting for confirmation
    if (confirmationRequest.run.status === 'WAITING_CONFIRMATION') {
      await prisma.aIAuditRun.update({
        where: { id: confirmationRequest.runId },
        data: {
          status: 'RUNNING',
          pendingConfirmationId: null,
        },
      })
    }

    // Log the response
    await prisma.aIAuditLog.create({
      data: {
        runId: confirmationRequest.runId,
        testExecutionId: confirmationRequest.testExecutionId,
        eventType: 'CONFIRMATION_RESPONSE',
        level: 'INFO',
        message: `Confirmación respondida: ${response} por ${session.user.name}`,
        metadataJson: JSON.stringify({
          confirmationId: id,
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
