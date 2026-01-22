import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  getSessionReportData,
  generateReportHash,
  formatDate,
  formatDuration,
  getStatusLabel,
  getPriorityLabel,
} from '@/lib/pdf-generator'

// POST /api/reports/generate - Generar reporte HTML/PDF
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { sessionId, type = 'DETAILED', format = 'HTML' } = body

    if (!sessionId) {
      return NextResponse.json({ error: 'ID de sesion requerido' }, { status: 400 })
    }

    const reportData = await getSessionReportData(sessionId)
    if (!reportData) {
      return NextResponse.json({ error: 'Sesion no encontrada' }, { status: 404 })
    }

    // Generar hash de integridad
    const hash = generateReportHash(reportData)
    const generatedAt = new Date()

    // Generar HTML del reporte
    const htmlContent = generateHTMLReport(reportData, type, {
      generatedBy: session.user.name,
      generatedAt,
      hash,
    })

    // Guardar registro del reporte en la base de datos
    const report = await prisma.report.create({
      data: {
        type,
        format: format === 'PDF' ? 'PDF' : 'HTML',
        fileName: `reporte-${reportData.session.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.${format === 'PDF' ? 'pdf' : 'html'}`,
        filePath: `/reports/${sessionId}`,
        fileSize: Buffer.byteLength(htmlContent, 'utf8'),
        hash,
        sessionId,
      },
    })

    // Crear log de auditoria
    await prisma.auditLog.create({
      data: {
        action: 'GENERATE_REPORT',
        entity: 'Report',
        entityId: report.id,
        userId: session.user.id,
        sessionId,
        details: `Reporte ${type} generado para sesion ${reportData.session.name}`,
      },
    })

    return NextResponse.json({
      success: true,
      reportId: report.id,
      html: htmlContent,
      hash,
      generatedAt: generatedAt.toISOString(),
    })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { error: 'Error al generar el reporte' },
      { status: 500 }
    )
  }
}

function generateHTMLReport(
  data: Awaited<ReturnType<typeof getSessionReportData>>,
  type: string,
  meta: { generatedBy: string; generatedAt: Date; hash: string }
): string {
  if (!data) return ''

  const { session, executions, statistics } = data

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reporte de Auditoria - ${session.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
      padding: 20px;
    }
    .container { max-width: 900px; margin: 0 auto; background: white; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { border-bottom: 3px solid #0d9488; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #0d9488; font-size: 28px; margin-bottom: 5px; }
    .header .subtitle { color: #666; font-size: 14px; }
    .meta-info { display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 30px; background: #f8f9fa; padding: 15px; border-radius: 8px; }
    .meta-item { flex: 1; min-width: 200px; }
    .meta-item label { font-size: 12px; color: #666; display: block; }
    .meta-item span { font-weight: 600; color: #333; }
    .section { margin-bottom: 30px; }
    .section h2 { color: #0d9488; font-size: 20px; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px; margin-bottom: 15px; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px; }
    .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
    .stat-card .value { font-size: 32px; font-weight: bold; }
    .stat-card .label { font-size: 12px; color: #666; margin-top: 5px; }
    .stat-card.passed .value { color: #16a34a; }
    .stat-card.failed .value { color: #dc2626; }
    .stat-card.blocked .value { color: #ca8a04; }
    .stat-card.rate .value { color: #0d9488; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e0e0e0; }
    th { background: #0d9488; color: white; font-weight: 600; font-size: 13px; }
    tr:hover { background: #f8f9fa; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; }
    .badge-passed { background: #dcfce7; color: #166534; }
    .badge-failed { background: #fee2e2; color: #991b1b; }
    .badge-blocked { background: #fef3c7; color: #92400e; }
    .badge-pending { background: #f3f4f6; color: #4b5563; }
    .badge-critical { background: #fee2e2; color: #991b1b; }
    .badge-high { background: #ffedd5; color: #9a3412; }
    .badge-medium { background: #fef3c7; color: #92400e; }
    .badge-low { background: #f3f4f6; color: #4b5563; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 11px; color: #666; }
    .footer .hash { font-family: monospace; word-break: break-all; background: #f3f4f6; padding: 8px; border-radius: 4px; margin-top: 5px; }
    .signature-section { margin-top: 50px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 40px; }
    .signature-box { border-top: 1px solid #333; padding-top: 10px; text-align: center; }
    .signature-box .role { font-weight: 600; }
    .signature-box .name { color: #666; font-size: 14px; }
    @media print {
      body { background: white; padding: 0; }
      .container { box-shadow: none; padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>AT5 Audit Platform</h1>
      <div class="subtitle">Reporte de Auditoria - ISO/IEC 29119</div>
    </div>

    <div class="meta-info">
      <div class="meta-item">
        <label>Sesion de Auditoria</label>
        <span>${session.name}</span>
      </div>
      <div class="meta-item">
        <label>Estado</label>
        <span>${getStatusLabel(session.status)}</span>
      </div>
      <div class="meta-item">
        <label>Auditor</label>
        <span>${session.auditor.name}</span>
      </div>
      <div class="meta-item">
        <label>Fecha de Generacion</label>
        <span>${formatDate(meta.generatedAt)}</span>
      </div>
    </div>

    <div class="section">
      <h2>Resumen Ejecutivo</h2>
      <p>${session.description || 'Sin descripcion disponible.'}</p>

      <div class="stats-grid" style="margin-top: 20px;">
        <div class="stat-card passed">
          <div class="value">${session.passedCount}</div>
          <div class="label">Casos Aprobados</div>
        </div>
        <div class="stat-card failed">
          <div class="value">${session.failedCount}</div>
          <div class="label">Casos Fallidos</div>
        </div>
        <div class="stat-card blocked">
          <div class="value">${session.blockedCount}</div>
          <div class="label">Casos Bloqueados</div>
        </div>
        <div class="stat-card rate">
          <div class="value">${statistics.successRate}%</div>
          <div class="label">Tasa de Exito</div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Plan de Pruebas</h2>
      <div class="meta-info">
        <div class="meta-item">
          <label>Titulo</label>
          <span>${session.testPlan.title}</span>
        </div>
        <div class="meta-item">
          <label>Version</label>
          <span>${session.testPlan.version}</span>
        </div>
      </div>
      <p style="margin-top: 10px;">${session.testPlan.description || 'Sin descripcion.'}</p>
    </div>

    <div class="section">
      <h2>Progreso de Ejecucion</h2>
      <div style="background: #e5e7eb; border-radius: 10px; height: 20px; overflow: hidden; margin: 15px 0;">
        <div style="background: #0d9488; height: 100%; width: ${session.progress}%;"></div>
      </div>
      <p style="text-align: center; color: #666;">${session.progress}% completado (${session.passedCount + session.failedCount + session.blockedCount + session.skippedCount} de ${session.totalCount} casos)</p>
    </div>

    ${type === 'DETAILED' || type === 'DEFECTS' ? `
    <div class="section">
      <h2>${type === 'DEFECTS' ? 'Casos Fallidos y Bloqueados' : 'Detalle de Ejecuciones'}</h2>
      <table>
        <thead>
          <tr>
            <th>Codigo</th>
            <th>Caso de Prueba</th>
            <th>Prioridad</th>
            <th>Estado</th>
            <th>Duracion</th>
          </tr>
        </thead>
        <tbody>
          ${(type === 'DEFECTS'
            ? executions.filter(e => e.status === 'FAILED' || e.status === 'BLOCKED')
            : executions
          ).map(exec => `
            <tr>
              <td><code>${exec.testCase.code}</code></td>
              <td>${exec.testCase.name}</td>
              <td><span class="badge badge-${exec.testCase.priority.toLowerCase()}">${getPriorityLabel(exec.testCase.priority)}</span></td>
              <td><span class="badge badge-${exec.status.toLowerCase()}">${getStatusLabel(exec.status)}</span></td>
              <td>${exec.duration ? formatDuration(exec.duration) : '-'}</td>
            </tr>
            ${exec.actualResult ? `
            <tr>
              <td colspan="5" style="background: #f8f9fa; font-size: 13px; padding-left: 30px;">
                <strong>Resultado:</strong> ${exec.actualResult}
                ${exec.comments ? `<br><strong>Notas:</strong> ${exec.comments}` : ''}
              </td>
            </tr>
            ` : ''}
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}

    ${type === 'METRICS' ? `
    <div class="section">
      <h2>Metricas por Prioridad</h2>
      <table>
        <thead>
          <tr>
            <th>Prioridad</th>
            <th>Total</th>
            <th>Aprobados</th>
            <th>Fallidos</th>
            <th>Tasa de Exito</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(statistics.executionsByPriority).map(([priority, stats]) => `
            <tr>
              <td><span class="badge badge-${priority.toLowerCase()}">${getPriorityLabel(priority)}</span></td>
              <td>${stats.total}</td>
              <td>${stats.passed}</td>
              <td>${stats.failed}</td>
              <td>${stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0}%</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>Tiempos de Ejecucion</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="value">${formatDuration(statistics.totalDuration)}</div>
          <div class="label">Tiempo Total</div>
        </div>
        <div class="stat-card">
          <div class="value">${formatDuration(statistics.averageDuration)}</div>
          <div class="label">Promedio por Caso</div>
        </div>
      </div>
    </div>
    ` : ''}

    <div class="signature-section">
      <div class="signature-box">
        <div class="role">Auditor Responsable</div>
        <div class="name">${session.auditor.name}</div>
      </div>
      <div class="signature-box">
        <div class="role">Revisor</div>
        <div class="name">___________________</div>
      </div>
    </div>

    <div class="footer">
      <p><strong>Generado por:</strong> ${meta.generatedBy} | <strong>Fecha:</strong> ${formatDate(meta.generatedAt)}</p>
      <p><strong>Hash de Integridad (SHA-256):</strong></p>
      <div class="hash">${meta.hash}</div>
      <p style="margin-top: 10px; font-style: italic;">Este reporte fue generado automaticamente por AT5 Audit Platform. La integridad del documento puede verificarse mediante el hash SHA-256 anterior.</p>
    </div>
  </div>
</body>
</html>`
}
