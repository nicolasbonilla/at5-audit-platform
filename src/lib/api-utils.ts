import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from './auth'

// ============================================
// Tipos de Error
// ============================================

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ValidationError extends ApiError {
  constructor(
    message: string,
    public errors: Record<string, string> = {}
  ) {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'No autorizado') {
    super(message, 401, 'AUTHENTICATION_ERROR')
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Sin permisos para realizar esta acción') {
    super(message, 403, 'AUTHORIZATION_ERROR')
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string = 'Recurso') {
    super(`${resource} no encontrado`, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT')
    this.name = 'ConflictError'
  }
}

// ============================================
// Manejador de Errores
// ============================================

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)

  if (error instanceof z.ZodError) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of error.errors) {
      const path = issue.path.join('.')
      fieldErrors[path] = issue.message
    }
    return NextResponse.json(
      {
        error: 'Datos de entrada inválidos',
        code: 'VALIDATION_ERROR',
        details: fieldErrors,
      },
      { status: 400 }
    )
  }

  if (error instanceof ApiError) {
    const response: Record<string, unknown> = {
      error: error.message,
      code: error.code,
    }
    if (error instanceof ValidationError && Object.keys(error.errors).length > 0) {
      response.details = error.errors
    }
    return NextResponse.json(response, { status: error.statusCode })
  }

  // Error de Prisma - Registro no encontrado
  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    (error as { code: string }).code === 'P2025'
  ) {
    return NextResponse.json(
      { error: 'Registro no encontrado', code: 'NOT_FOUND' },
      { status: 404 }
    )
  }

  // Error de Prisma - Violación de restricción única
  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    (error as { code: string }).code === 'P2002'
  ) {
    return NextResponse.json(
      { error: 'El registro ya existe', code: 'DUPLICATE_ENTRY' },
      { status: 409 }
    )
  }

  // Error genérico
  const message = error instanceof Error ? error.message : 'Error interno del servidor'
  return NextResponse.json(
    { error: message, code: 'INTERNAL_ERROR' },
    { status: 500 }
  )
}

// ============================================
// Verificación de Autenticación
// ============================================

type UserRole = 'ADMIN' | 'LEAD_AUDITOR' | 'AUDITOR' | 'REVIEWER' | 'VIEWER'

interface AuthenticatedUser {
  id: string
  email: string
  name: string
  role: UserRole
}

export async function requireAuth(): Promise<AuthenticatedUser> {
  const session = await auth()
  if (!session?.user) {
    throw new AuthenticationError()
  }
  return {
    id: session.user.id,
    email: session.user.email!,
    name: session.user.name!,
    role: session.user.role as UserRole,
  }
}

export async function requireRole(allowedRoles: UserRole[]): Promise<AuthenticatedUser> {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) {
    throw new AuthorizationError()
  }
  return user
}

// ============================================
// Permisos por Rol
// ============================================

export const ROLE_PERMISSIONS = {
  ADMIN: {
    canManageUsers: true,
    canManageTestPlans: true,
    canManageSessions: true,
    canExecuteTests: true,
    canReviewSessions: true,
    canApprove: true,
    canSign: true,
    canViewAuditLogs: true,
    canVerifyIntegrity: true,
    canExport: true,
  },
  LEAD_AUDITOR: {
    canManageUsers: false,
    canManageTestPlans: true,
    canManageSessions: true,
    canExecuteTests: true,
    canReviewSessions: true,
    canApprove: true,
    canSign: true,
    canViewAuditLogs: true,
    canVerifyIntegrity: true,
    canExport: true,
  },
  AUDITOR: {
    canManageUsers: false,
    canManageTestPlans: false,
    canManageSessions: false,
    canExecuteTests: true,
    canReviewSessions: false,
    canApprove: false,
    canSign: false,
    canViewAuditLogs: false,
    canVerifyIntegrity: false,
    canExport: true,
  },
  REVIEWER: {
    canManageUsers: false,
    canManageTestPlans: false,
    canManageSessions: false,
    canExecuteTests: false,
    canReviewSessions: true,
    canApprove: false,
    canSign: true,
    canViewAuditLogs: true,
    canVerifyIntegrity: false,
    canExport: true,
  },
  VIEWER: {
    canManageUsers: false,
    canManageTestPlans: false,
    canManageSessions: false,
    canExecuteTests: false,
    canReviewSessions: false,
    canApprove: false,
    canSign: false,
    canViewAuditLogs: false,
    canVerifyIntegrity: false,
    canExport: false,
  },
} as const

export function hasPermission(
  role: UserRole,
  permission: keyof typeof ROLE_PERMISSIONS.ADMIN
): boolean {
  return ROLE_PERMISSIONS[role][permission]
}

export async function requirePermission(
  permission: keyof typeof ROLE_PERMISSIONS.ADMIN
): Promise<AuthenticatedUser> {
  const user = await requireAuth()
  if (!hasPermission(user.role, permission)) {
    throw new AuthorizationError(`No tiene permiso para: ${permission}`)
  }
  return user
}

// ============================================
// Utilidades de Request
// ============================================

export async function parseJsonBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json()
    return schema.parse(body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw error
    }
    if (error instanceof SyntaxError) {
      throw new ValidationError('JSON inválido en el cuerpo de la solicitud')
    }
    throw error
  }
}

export function parseQueryParams<T>(
  url: URL,
  schema: z.ZodSchema<T>
): T {
  const params: Record<string, string> = {}
  url.searchParams.forEach((value, key) => {
    params[key] = value
  })
  return schema.parse(params)
}

// ============================================
// Respuestas Estandarizadas
// ============================================

export function successResponse<T>(
  data: T,
  status: number = 200
): NextResponse<T> {
  return NextResponse.json(data, { status })
}

export function createdResponse<T>(data: T): NextResponse<T> {
  return NextResponse.json(data, { status: 201 })
}

export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 })
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): NextResponse {
  return NextResponse.json({
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  })
}
