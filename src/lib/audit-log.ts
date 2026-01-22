import { prisma } from '@/lib/prisma'
import { createHash } from 'crypto'

export interface AuditLogEntry {
  action: string
  entity: string
  entityId: string
  userId: string
  sessionId?: string
  oldValue?: Record<string, unknown>
  newValue?: Record<string, unknown>
  changes?: Record<string, unknown>
  details?: string
  ipAddress?: string
  userAgent?: string
}

/**
 * Crea un hash SHA-256 para un registro de audit log
 * El hash incluye los datos del registro y el hash del registro anterior
 * creando una cadena de integridad similar a blockchain
 */
function createAuditHash(
  entry: AuditLogEntry,
  timestamp: Date,
  previousHash: string | null
): string {
  const data = JSON.stringify({
    action: entry.action,
    entity: entry.entity,
    entityId: entry.entityId,
    userId: entry.userId,
    sessionId: entry.sessionId || null,
    oldValue: entry.oldValue ? JSON.stringify(entry.oldValue) : null,
    newValue: entry.newValue ? JSON.stringify(entry.newValue) : null,
    changes: entry.changes ? JSON.stringify(entry.changes) : null,
    details: entry.details || null,
    timestamp: timestamp.toISOString(),
    previousHash: previousHash || 'GENESIS',
  })

  return createHash('sha256').update(data).digest('hex')
}

/**
 * Crea una entrada en el audit log con hash de integridad
 * El hash se calcula incluyendo el hash del registro anterior,
 * creando una cadena inmutable
 */
export async function createAuditLog(entry: AuditLogEntry) {
  // Obtener el ultimo registro para encadenar el hash
  const lastLog = await prisma.auditLog.findFirst({
    orderBy: { timestamp: 'desc' },
    select: { hash: true },
  })

  const timestamp = new Date()
  const hash = createAuditHash(entry, timestamp, lastLog?.hash || null)

  return prisma.auditLog.create({
    data: {
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId,
      userId: entry.userId,
      sessionId: entry.sessionId,
      oldValue: entry.oldValue ? JSON.stringify(entry.oldValue) : null,
      newValue: entry.newValue ? JSON.stringify(entry.newValue) : null,
      details: entry.details,
      ipAddress: entry.ipAddress || '127.0.0.1',
      userAgent: entry.userAgent,
      hash,
      previousHash: lastLog?.hash || null,
      timestamp,
    },
  })
}

/**
 * Verifica la integridad de la cadena de audit logs
 * Recalcula los hashes y compara con los almacenados
 */
export async function verifyAuditLogIntegrity(): Promise<{
  valid: boolean
  totalRecords: number
  invalidRecords: Array<{ id: string; expectedHash: string; actualHash: string }>
}> {
  const logs = await prisma.auditLog.findMany({
    orderBy: { timestamp: 'asc' },
  })

  const invalidRecords: Array<{ id: string; expectedHash: string; actualHash: string }> = []
  let previousHash: string | null = null

  for (const log of logs) {
    const expectedHash = createAuditHash(
      {
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        userId: log.userId,
        sessionId: log.sessionId || undefined,
        oldValue: log.oldValue ? JSON.parse(log.oldValue) : undefined,
        newValue: log.newValue ? JSON.parse(log.newValue) : undefined,
        details: log.details || undefined,
      },
      log.timestamp,
      previousHash
    )

    if (log.hash !== expectedHash) {
      invalidRecords.push({
        id: log.id,
        expectedHash,
        actualHash: log.hash || 'null',
      })
    }

    previousHash = log.hash
  }

  return {
    valid: invalidRecords.length === 0,
    totalRecords: logs.length,
    invalidRecords,
  }
}

/**
 * Obtiene los logs de auditoria con paginacion
 */
export async function getAuditLogs(options: {
  page?: number
  limit?: number
  userId?: string
  sessionId?: string
  entity?: string
  action?: string
  startDate?: Date
  endDate?: Date
}) {
  const {
    page = 1,
    limit = 50,
    userId,
    sessionId,
    entity,
    action,
    startDate,
    endDate,
  } = options

  const where: Record<string, unknown> = {}

  if (userId) where.userId = userId
  if (sessionId) where.sessionId = sessionId
  if (entity) where.entity = entity
  if (action) where.action = action
  if (startDate || endDate) {
    where.timestamp = {}
    if (startDate) (where.timestamp as Record<string, Date>).gte = startDate
    if (endDate) (where.timestamp as Record<string, Date>).lte = endDate
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
        session: {
          select: { id: true, name: true },
        },
      },
      orderBy: { timestamp: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ])

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

// Acciones estandar de auditoria
export const AUDIT_ACTIONS = {
  // Autenticacion
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  LOGIN_FAILED: 'LOGIN_FAILED',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',

  // Sesiones de auditoria
  SESSION_CREATED: 'SESSION_CREATED',
  SESSION_UPDATED: 'SESSION_UPDATED',
  SESSION_DELETED: 'SESSION_DELETED',
  SESSION_STARTED: 'SESSION_STARTED',
  SESSION_COMPLETED: 'SESSION_COMPLETED',
  SESSION_APPROVED: 'SESSION_APPROVED',
  SESSION_REJECTED: 'SESSION_REJECTED',

  // Ejecucion de pruebas
  TEST_EXECUTED: 'TEST_EXECUTED',
  TEST_PASSED: 'TEST_PASSED',
  TEST_FAILED: 'TEST_FAILED',
  TEST_BLOCKED: 'TEST_BLOCKED',
  TEST_SKIPPED: 'TEST_SKIPPED',
  EXECUTION_UPDATED: 'EXECUTION_UPDATED',

  // Evidencias
  EVIDENCE_UPLOADED: 'EVIDENCE_UPLOADED',
  EVIDENCE_DELETED: 'EVIDENCE_DELETED',

  // Firmas
  SIGNATURE_ADDED: 'SIGNATURE_ADDED',
  SIGNATURE_VERIFIED: 'SIGNATURE_VERIFIED',

  // Reportes
  REPORT_GENERATED: 'REPORT_GENERATED',
  REPORT_EXPORTED: 'REPORT_EXPORTED',
  REPORT_DOWNLOADED: 'REPORT_DOWNLOADED',

  // Administracion
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DEACTIVATED: 'USER_DEACTIVATED',
  SETTINGS_CHANGED: 'SETTINGS_CHANGED',
} as const
