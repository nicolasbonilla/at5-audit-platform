import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ExcelJS from 'exceljs'
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/audit-log'

// GET /api/export/session/[id] - Exportar sesion a Excel o CSV
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authSession = await auth()
    if (!authSession?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'xlsx'

    // Obtener datos completos de la sesion
    const session = await prisma.auditSession.findUnique({
      where: { id },
      include: {
        auditor: {
          select: { name: true, email: true, role: true },
        },
        testPlan: {
          include: {
            testSuites: {
              include: {
                testCases: true,
              },
              orderBy: { order: 'asc' },
            },
          },
        },
        executions: {
          include: {
            testCase: true,
            executedBy: {
              select: { name: true },
            },
            evidences: true,
          },
        },
        signatures: {
          include: {
            user: {
              select: { name: true, email: true },
            },
          },
        },
      },
    })

    if (!session) {
      return NextResponse.json({ error: 'Sesion no encontrada' }, { status: 404 })
    }

    // Crear mapa de ejecuciones
    const executionMap = new Map(
      session.executions.map(e => [e.testCaseId, e])
    )

    if (format === 'csv') {
      // Exportar como CSV
      const csvRows: string[] = []

      // Header
      csvRows.push([
        'Codigo',
        'Nombre',
        'Suite',
        'Prioridad',
        'Tipo',
        'Estado',
        'Resultado Actual',
        'Ejecutor',
        'Fecha Ejecucion',
        'Duracion (s)',
        'Evidencias',
      ].join(','))

      // Filas de datos
      for (const suite of session.testPlan?.testSuites || []) {
        for (const tc of suite.testCases) {
          const execution = executionMap.get(tc.id)
          csvRows.push([
            tc.code,
            `"${tc.name.replace(/"/g, '""')}"`,
            `"${suite.name.replace(/"/g, '""')}"`,
            tc.priority,
            tc.testType,
            execution?.status || 'NOT_STARTED',
            `"${(execution?.actualResult || '').replace(/"/g, '""')}"`,
            execution?.executedBy?.name || '',
            execution?.endTime ? new Date(execution.endTime).toISOString() : '',
            execution?.duration?.toString() || '',
            execution?.evidences?.length?.toString() || '0',
          ].join(','))
        }
      }

      // Registrar en audit log
      await createAuditLog({
        action: AUDIT_ACTIONS.REPORT_EXPORTED,
        entity: 'AuditSession',
        entityId: id,
        userId: authSession.user.id,
        sessionId: id,
        details: `Sesion exportada a CSV`,
      })

      return new NextResponse(csvRows.join('\n'), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="session-${session.name.replace(/[^a-z0-9]/gi, '_')}-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }

    // Exportar como Excel
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'AT5 Audit Platform'
    workbook.created = new Date()

    // Hoja de Resumen
    const summarySheet = workbook.addWorksheet('Resumen')
    summarySheet.columns = [
      { header: 'Campo', key: 'field', width: 25 },
      { header: 'Valor', key: 'value', width: 50 },
    ]

    summarySheet.addRows([
      { field: 'Nombre de Sesion', value: session.name },
      { field: 'Descripcion', value: session.description || 'N/A' },
      { field: 'Estado', value: session.status },
      { field: 'Auditor', value: session.auditor?.name || 'N/A' },
      { field: 'Plan de Pruebas', value: session.testPlan?.title || 'N/A' },
      { field: 'Fecha Inicio', value: session.startDate?.toLocaleDateString() || 'N/A' },
      { field: 'Fecha Fin', value: session.endDate?.toLocaleDateString() || 'N/A' },
      { field: 'Progreso', value: `${session.progress}%` },
      { field: '', value: '' },
      { field: 'Estadisticas', value: '' },
      { field: 'Total Casos', value: session.totalCount },
      { field: 'Aprobados', value: session.passedCount },
      { field: 'Fallidos', value: session.failedCount },
      { field: 'Bloqueados', value: session.blockedCount },
      { field: 'Omitidos', value: session.skippedCount },
      { field: 'Tasa de Exito', value: session.passedCount + session.failedCount > 0
        ? `${Math.round((session.passedCount / (session.passedCount + session.failedCount)) * 100)}%`
        : 'N/A' },
    ])

    // Estilo del encabezado
    summarySheet.getRow(1).font = { bold: true }
    summarySheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '0d9488' },
    }
    summarySheet.getRow(1).font = { color: { argb: 'FFFFFF' }, bold: true }

    // Hoja de Casos de Prueba
    const casesSheet = workbook.addWorksheet('Casos de Prueba')
    casesSheet.columns = [
      { header: 'Codigo', key: 'code', width: 15 },
      { header: 'Nombre', key: 'name', width: 40 },
      { header: 'Suite', key: 'suite', width: 25 },
      { header: 'Prioridad', key: 'priority', width: 12 },
      { header: 'Tipo', key: 'type', width: 15 },
      { header: 'Estado', key: 'status', width: 15 },
      { header: 'Resultado Actual', key: 'result', width: 50 },
      { header: 'Ejecutor', key: 'executor', width: 20 },
      { header: 'Fecha', key: 'date', width: 20 },
      { header: 'Duracion (s)', key: 'duration', width: 12 },
      { header: 'Evidencias', key: 'evidences', width: 12 },
    ]

    for (const suite of session.testPlan?.testSuites || []) {
      for (const tc of suite.testCases) {
        const execution = executionMap.get(tc.id)
        casesSheet.addRow({
          code: tc.code,
          name: tc.name,
          suite: suite.name,
          priority: tc.priority,
          type: tc.testType,
          status: execution?.status || 'NOT_STARTED',
          result: execution?.actualResult || '',
          executor: execution?.executedBy?.name || '',
          date: execution?.endTime ? new Date(execution.endTime).toLocaleDateString() : '',
          duration: execution?.duration || '',
          evidences: execution?.evidences?.length || 0,
        })
      }
    }

    // Estilo del encabezado
    casesSheet.getRow(1).font = { bold: true }
    casesSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '0d9488' },
    }
    casesSheet.getRow(1).font = { color: { argb: 'FFFFFF' }, bold: true }

    // Colorear filas segun estado
    casesSheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return
      const status = row.getCell('status').value
      let color = 'FFFFFF'
      if (status === 'PASSED') color = 'DCFCE7'
      else if (status === 'FAILED') color = 'FEE2E2'
      else if (status === 'BLOCKED') color = 'FEF3C7'

      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: color },
      }
    })

    // Hoja de Firmas
    if (session.signatures.length > 0) {
      const signaturesSheet = workbook.addWorksheet('Firmas')
      signaturesSheet.columns = [
        { header: 'Firmante', key: 'name', width: 25 },
        { header: 'Email', key: 'email', width: 35 },
        { header: 'Rol', key: 'role', width: 20 },
        { header: 'Fecha', key: 'date', width: 25 },
        { header: 'IP', key: 'ip', width: 15 },
        { header: 'Certificado', key: 'cert', width: 40 },
      ]

      for (const sig of session.signatures) {
        signaturesSheet.addRow({
          name: sig.user.name,
          email: sig.user.email,
          role: sig.role,
          date: new Date(sig.signedAt).toLocaleString(),
          ip: sig.ipAddress || 'N/A',
          cert: sig.certificate ? `${sig.certificate.substring(0, 32)}...` : 'N/A',
        })
      }

      signaturesSheet.getRow(1).font = { bold: true }
      signaturesSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '0d9488' },
      }
      signaturesSheet.getRow(1).font = { color: { argb: 'FFFFFF' }, bold: true }
    }

    // Generar buffer
    const buffer = await workbook.xlsx.writeBuffer()

    // Registrar en audit log
    await createAuditLog({
      action: AUDIT_ACTIONS.REPORT_EXPORTED,
      entity: 'AuditSession',
      entityId: id,
      userId: authSession.user.id,
      sessionId: id,
      details: `Sesion exportada a Excel`,
    })

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="session-${session.name.replace(/[^a-z0-9]/gi, '_')}-${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    })
  } catch (error) {
    console.error('Error exporting session:', error)
    return NextResponse.json(
      { error: 'Error al exportar la sesion' },
      { status: 500 }
    )
  }
}
