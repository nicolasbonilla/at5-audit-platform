/**
 * AT5 AI Auditor - Global Confirmations API
 *
 * Endpoints for listing all pending confirmations across all runs.
 *
 * Endpoints:
 * - GET /api/ai-auditor/confirmations - List all pending confirmations
 *
 * @module api/ai-auditor/confirmations
 * @version 1.0.0
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// ============================================================================
// GET /api/ai-auditor/confirmations - List All Pending Confirmations
// ============================================================================

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'No autorizado' } },
        { status: 401 }
      )
    }

    // Get all pending confirmations
    const confirmations = await prisma.aIConfirmationRequest.findMany({
      where: {
        status: 'PENDING',
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        run: {
          select: {
            id: true,
            runNumber: true,
            sessionId: true,
            session: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    const formattedConfirmations = confirmations.map(conf => ({
      id: conf.id,
      runId: conf.runId,
      runNumber: conf.run.runNumber,
      sessionName: conf.run.session.name,
      type: conf.type,
      action: conf.action,
      context: conf.context,
      aiExplanation: conf.aiExplanation,
      parameters: JSON.parse(conf.parametersJson),
      testExecutionId: conf.testExecutionId,
      expiresAt: conf.expiresAt,
      createdAt: conf.createdAt,
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
