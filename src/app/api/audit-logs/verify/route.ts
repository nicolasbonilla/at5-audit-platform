import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { verifyAuditLogIntegrity } from '@/lib/audit-log'

// POST /api/audit-logs/verify - Verificar integridad de la cadena de logs
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo ADMIN y LEAD_AUDITOR pueden verificar integridad
    if (!['ADMIN', 'LEAD_AUDITOR'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Sin permisos para verificar integridad' }, { status: 403 })
    }

    const result = await verifyAuditLogIntegrity()

    return NextResponse.json({
      ...result,
      verifiedAt: new Date().toISOString(),
      verifiedBy: session.user.id,
    })
  } catch (error) {
    console.error('Error verifying audit log integrity:', error)
    return NextResponse.json(
      { error: 'Error al verificar la integridad de los logs' },
      { status: 500 }
    )
  }
}
