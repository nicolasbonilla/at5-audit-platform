import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getAuditLogs, AUDIT_ACTIONS } from '@/lib/audit-log'

// GET /api/audit-logs - Obtener registros de auditoria
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo ADMIN, LEAD_AUDITOR y REVIEWER pueden ver logs
    if (!['ADMIN', 'LEAD_AUDITOR', 'REVIEWER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Sin permisos para ver logs de auditoria' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const userId = searchParams.get('userId') || undefined
    const sessionId = searchParams.get('sessionId') || undefined
    const entity = searchParams.get('entity') || undefined
    const action = searchParams.get('action') || undefined
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : undefined
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : undefined

    const result = await getAuditLogs({
      page,
      limit,
      userId,
      sessionId,
      entity,
      action,
      startDate,
      endDate,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json(
      { error: 'Error al obtener los registros de auditoria' },
      { status: 500 }
    )
  }
}
