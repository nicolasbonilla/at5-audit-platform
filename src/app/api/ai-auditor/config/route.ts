/**
 * AT5 AI Auditor - Configuration API
 *
 * Endpoints for managing AI Auditor configurations.
 *
 * Endpoints:
 * - GET /api/ai-auditor/config - List configurations
 * - POST /api/ai-auditor/config - Create new configuration
 *
 * @module api/ai-auditor/config
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { aiAuditorConfigSchema } from '@/lib/ai-auditor/types'

// ============================================================================
// GET /api/ai-auditor/config - List Configurations
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
    const organizationId = searchParams.get('organizationId')
    const activeOnly = searchParams.get('activeOnly') === 'true'

    // Build query
    const where: Record<string, unknown> = {}

    if (organizationId) {
      where.organizationId = organizationId
    }

    if (activeOnly) {
      where.isActive = true
    }

    const configs = await prisma.aIAuditorConfig.findMany({
      where,
      orderBy: [
        { isDefault: 'desc' },
        { name: 'asc' },
      ],
    })

    // Get organization names separately
    const orgIds = [...new Set(configs.map(c => c.organizationId))]
    const organizations = await prisma.organization.findMany({
      where: { id: { in: orgIds } },
      select: { id: true, name: true },
    })
    const orgMap = new Map(organizations.map(o => [o.id, o]))

    // Get run counts separately
    const runCounts = await prisma.aIAuditRun.groupBy({
      by: ['configId'],
      _count: { id: true },
      where: { configId: { in: configs.map(c => c.id) } },
    })
    const runCountMap = new Map(runCounts.map(r => [r.configId, r._count.id]))

    const formattedConfigs = configs.map(config => ({
      id: config.id,
      name: config.name,
      description: config.description,
      isActive: config.isActive,
      isDefault: config.isDefault,
      llm: {
        provider: config.llmProvider,
        model: config.llmModel,
        temperature: config.llmTemperature,
        maxTokens: config.llmMaxTokens,
      },
      mcp: {
        connectionType: config.mcpConnectionType,
        host: config.mcpServerHost,
        port: config.mcpServerPort,
        pipeName: config.mcpPipeName,
        timeoutMs: config.mcpTimeoutMs,
      },
      execution: {
        maxConcurrentTests: config.maxConcurrentTests,
        delayBetweenTestsMs: config.delayBetweenTestsMs,
        maxRetries: config.maxRetries,
        retryDelayMs: config.retryDelayMs,
        stopOnCriticalFailure: config.stopOnCriticalFailure,
        actionsRequiringConfirmation: JSON.parse(config.actionsRequiringConfirmation),
      },
      evidence: {
        captureScreenshots: config.captureScreenshots,
        captureLogs: config.captureLogs,
        captureApiResponses: config.captureApiResponses,
      },
      organization: orgMap.get(config.organizationId) || null,
      runsCount: runCountMap.get(config.id) || 0,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    }))

    return NextResponse.json({
      success: true,
      data: formattedConfigs,
    })

  } catch (error) {
    console.error('Error listing AI Auditor configs:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al obtener las configuraciones',
          details: error instanceof Error ? error.message : undefined,
        },
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST /api/ai-auditor/config - Create Configuration
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

    // Check if user has admin role
    if (session.user.role !== 'ADMIN' && session.user.role !== 'LEAD_AUDITOR') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'No tiene permisos para crear configuraciones de AI Auditor',
          },
        },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Validate input
    const validation = aiAuditorConfigSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Datos de configuración inválidos',
            details: validation.error.errors,
          },
        },
        { status: 400 }
      )
    }

    const input = validation.data

    // Verify organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: input.organizationId },
    })

    if (!organization) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ORGANIZATION_NOT_FOUND',
            message: 'Organización no encontrada',
          },
        },
        { status: 404 }
      )
    }

    // Check if name is unique within organization
    const existingConfig = await prisma.aIAuditorConfig.findFirst({
      where: {
        organizationId: input.organizationId,
        name: input.name,
      },
    })

    if (existingConfig) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CONFIG_NAME_EXISTS',
            message: 'Ya existe una configuración con este nombre',
          },
        },
        { status: 409 }
      )
    }

    // Create configuration
    const config = await prisma.aIAuditorConfig.create({
      data: {
        name: input.name,
        description: input.description,
        isActive: input.isActive,
        isDefault: false, // Must be set explicitly

        llmProvider: input.llmProvider,
        llmModel: input.llmModel,
        llmTemperature: input.llmTemperature,
        llmMaxTokens: input.llmMaxTokens,

        mcpConnectionType: input.mcpConnectionType,
        mcpServerHost: input.mcpServerHost,
        mcpServerPort: input.mcpServerPort,
        mcpPipeName: input.mcpPipeName,
        mcpTimeoutMs: input.mcpTimeoutMs,

        maxConcurrentTests: input.maxConcurrentTests,
        delayBetweenTestsMs: input.delayBetweenTestsMs,
        maxRetries: input.maxRetries,
        retryDelayMs: input.retryDelayMs,
        stopOnCriticalFailure: input.stopOnCriticalFailure,
        actionsRequiringConfirmation: JSON.stringify(input.actionsRequiringConfirmation),

        captureScreenshots: input.captureScreenshots,
        captureLogs: input.captureLogs,
        captureApiResponses: input.captureApiResponses,

        organizationId: input.organizationId,
        createdById: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: config.id,
        name: config.name,
        message: 'Configuración creada exitosamente',
      },
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating AI Auditor config:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error al crear la configuración',
          details: error instanceof Error ? error.message : undefined,
        },
      },
      { status: 500 }
    )
  }
}
