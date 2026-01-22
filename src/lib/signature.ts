import { prisma } from '@/lib/prisma'
import { createHash } from 'crypto'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit-log'

export interface SignatureData {
  userId: string
  sessionId: string
  role: string
  signatureImage?: string // Base64 encoded signature image
  ipAddress?: string
  userAgent?: string
}

/**
 * Crea un hash de la firma que incluye los datos de la sesion
 * para garantizar la integridad de la firma
 */
function createSignatureHash(data: {
  userId: string
  sessionId: string
  role: string
  timestamp: Date
  sessionData: string
}): string {
  const hashData = JSON.stringify({
    userId: data.userId,
    sessionId: data.sessionId,
    role: data.role,
    timestamp: data.timestamp.toISOString(),
    sessionData: data.sessionData,
  })

  return createHash('sha256').update(hashData).digest('hex')
}

/**
 * Crea una firma digital para una sesion de auditoria
 */
export async function createSignature(data: SignatureData) {
  // Obtener los datos de la sesion para incluirlos en el hash
  const session = await prisma.auditSession.findUnique({
    where: { id: data.sessionId },
    include: {
      testPlan: { select: { title: true, version: true } },
      executions: {
        select: {
          status: true,
          testCase: { select: { code: true } },
        },
      },
    },
  })

  if (!session) {
    throw new Error('Sesion no encontrada')
  }

  // Verificar que el usuario existe
  const user = await prisma.user.findUnique({
    where: { id: data.userId },
  })

  if (!user) {
    throw new Error('Usuario no encontrado')
  }

  // Crear el hash de la sesion para la firma
  const sessionData = JSON.stringify({
    name: session.name,
    status: session.status,
    testPlan: session.testPlan,
    passedCount: session.passedCount,
    failedCount: session.failedCount,
    blockedCount: session.blockedCount,
    skippedCount: session.skippedCount,
    totalCount: session.totalCount,
    progress: session.progress,
    executions: session.executions.map(e => ({
      status: e.status,
      testCode: e.testCase.code,
    })),
  })

  const timestamp = new Date()
  const certificate = createSignatureHash({
    userId: data.userId,
    sessionId: data.sessionId,
    role: data.role,
    timestamp,
    sessionData,
  })

  // Crear la firma
  const signature = await prisma.signature.create({
    data: {
      role: data.role,
      signatureData: data.signatureImage || null,
      certificate,
      ipAddress: data.ipAddress || '127.0.0.1',
      userAgent: data.userAgent,
      userId: data.userId,
      sessionId: data.sessionId,
      signedAt: timestamp,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
  })

  // Registrar en audit log
  await createAuditLog({
    action: AUDIT_ACTIONS.SIGNATURE_ADDED,
    entity: 'Signature',
    entityId: signature.id,
    userId: data.userId,
    sessionId: data.sessionId,
    details: `Firma agregada por ${user.name} como ${data.role}`,
    newValue: {
      role: data.role,
      certificate: certificate.substring(0, 16) + '...',
    },
  })

  return signature
}

/**
 * Verifica la integridad de una firma
 */
export async function verifySignature(signatureId: string): Promise<{
  valid: boolean
  signature: {
    id: string
    role: string
    signedAt: Date
    user: { name: string; email: string }
  } | null
  reason?: string
}> {
  const signature = await prisma.signature.findUnique({
    where: { id: signatureId },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      session: {
        include: {
          testPlan: { select: { title: true, version: true } },
          executions: {
            select: {
              status: true,
              testCase: { select: { code: true } },
            },
          },
        },
      },
    },
  })

  if (!signature) {
    return { valid: false, signature: null, reason: 'Firma no encontrada' }
  }

  // Recalcular el hash con los datos actuales
  const sessionData = JSON.stringify({
    name: signature.session.name,
    status: signature.session.status,
    testPlan: signature.session.testPlan,
    passedCount: signature.session.passedCount,
    failedCount: signature.session.failedCount,
    blockedCount: signature.session.blockedCount,
    skippedCount: signature.session.skippedCount,
    totalCount: signature.session.totalCount,
    progress: signature.session.progress,
    executions: signature.session.executions.map(e => ({
      status: e.status,
      testCode: e.testCase.code,
    })),
  })

  const expectedHash = createSignatureHash({
    userId: signature.userId,
    sessionId: signature.sessionId,
    role: signature.role,
    timestamp: signature.signedAt,
    sessionData,
  })

  const isValid = signature.certificate === expectedHash

  // Registrar verificacion en audit log
  await createAuditLog({
    action: AUDIT_ACTIONS.SIGNATURE_VERIFIED,
    entity: 'Signature',
    entityId: signatureId,
    userId: signature.userId,
    sessionId: signature.sessionId,
    details: `Verificacion de firma: ${isValid ? 'VALIDA' : 'INVALIDA'}`,
  })

  return {
    valid: isValid,
    signature: {
      id: signature.id,
      role: signature.role,
      signedAt: signature.signedAt,
      user: signature.user,
    },
    reason: isValid ? undefined : 'Hash de certificado no coincide - posible alteracion',
  }
}

/**
 * Obtiene las firmas de una sesion
 */
export async function getSessionSignatures(sessionId: string) {
  return prisma.signature.findMany({
    where: { sessionId },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true, avatar: true },
      },
    },
    orderBy: { signedAt: 'desc' },
  })
}

/**
 * Verifica si una sesion tiene todas las firmas requeridas
 */
export async function checkRequiredSignatures(sessionId: string): Promise<{
  complete: boolean
  missing: string[]
  signatures: Array<{ role: string; signedBy: string; signedAt: Date }>
}> {
  const requiredRoles = ['LEAD_AUDITOR', 'REVIEWER']

  const signatures = await getSessionSignatures(sessionId)

  const signedRoles = signatures.map(s => s.role)
  const missing = requiredRoles.filter(role => !signedRoles.includes(role))

  return {
    complete: missing.length === 0,
    missing,
    signatures: signatures.map(s => ({
      role: s.role,
      signedBy: s.user.name,
      signedAt: s.signedAt,
    })),
  }
}
