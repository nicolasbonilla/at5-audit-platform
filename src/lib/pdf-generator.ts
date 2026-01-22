import { prisma } from '@/lib/prisma'
import { createHash } from 'crypto'

export interface ReportData {
  sessionId: string
  type: 'EXECUTIVE_SUMMARY' | 'DETAILED' | 'DEFECTS' | 'METRICS'
  generatedBy: {
    id: string
    name: string
    email: string
  }
}

export interface SessionReportData {
  session: {
    id: string
    name: string
    description: string | null
    status: string
    startDate: Date | null
    endDate: Date | null
    progress: number
    passedCount: number
    failedCount: number
    blockedCount: number
    skippedCount: number
    totalCount: number
    auditor: {
      name: string
      email: string
      role: string
    }
    testPlan: {
      title: string
      version: string
      description: string | null
    }
  }
  executions: Array<{
    id: string
    status: string
    actualResult: string | null
    comments: string | null
    startTime: Date | null
    endTime: Date | null
    duration: number | null
    testCase: {
      code: string
      name: string
      priority: string
      expectedResult: string
    }
    executedBy: {
      name: string
    }
  }>
  statistics: {
    successRate: number
    totalDuration: number
    averageDuration: number
    executionsByPriority: Record<string, { passed: number; failed: number; total: number }>
  }
}

export async function getSessionReportData(sessionId: string): Promise<SessionReportData | null> {
  const session = await prisma.auditSession.findUnique({
    where: { id: sessionId },
    include: {
      auditor: true,
      testPlan: true,
      executions: {
        include: {
          testCase: true,
          executedBy: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  })

  if (!session) return null

  // Calcular estadisticas
  const executions = session.executions
  const totalDuration = executions.reduce((acc, e) => acc + (e.duration || 0), 0)
  const executedCount = executions.filter(e => e.status !== 'NOT_STARTED').length
  const averageDuration = executedCount > 0 ? Math.round(totalDuration / executedCount) : 0

  const passedCount = executions.filter(e => e.status === 'PASSED').length
  const failedCount = executions.filter(e => e.status === 'FAILED').length
  const successRate = (passedCount + failedCount) > 0
    ? Math.round((passedCount / (passedCount + failedCount)) * 100)
    : 0

  // Estadisticas por prioridad
  const executionsByPriority: Record<string, { passed: number; failed: number; total: number }> = {}
  for (const exec of executions) {
    const priority = exec.testCase.priority
    if (!executionsByPriority[priority]) {
      executionsByPriority[priority] = { passed: 0, failed: 0, total: 0 }
    }
    executionsByPriority[priority].total++
    if (exec.status === 'PASSED') executionsByPriority[priority].passed++
    if (exec.status === 'FAILED') executionsByPriority[priority].failed++
  }

  return {
    session: {
      id: session.id,
      name: session.name,
      description: session.description,
      status: session.status,
      startDate: session.startDate,
      endDate: session.endDate,
      progress: session.progress,
      passedCount: session.passedCount,
      failedCount: session.failedCount,
      blockedCount: session.blockedCount,
      skippedCount: session.skippedCount,
      totalCount: session.totalCount,
      auditor: {
        name: session.auditor.name,
        email: session.auditor.email,
        role: session.auditor.role,
      },
      testPlan: {
        title: session.testPlan.title,
        version: session.testPlan.version,
        description: session.testPlan.description,
      },
    },
    executions: executions.map(e => ({
      id: e.id,
      status: e.status,
      actualResult: e.actualResult,
      comments: e.comments,
      startTime: e.startTime,
      endTime: e.endTime,
      duration: e.duration,
      testCase: {
        code: e.testCase.code,
        name: e.testCase.name,
        priority: e.testCase.priority,
        expectedResult: e.testCase.expectedResult,
      },
      executedBy: {
        name: e.executedBy.name,
      },
    })),
    statistics: {
      successRate,
      totalDuration,
      averageDuration,
      executionsByPriority,
    },
  }
}

export function generateReportHash(data: SessionReportData): string {
  const content = JSON.stringify(data)
  return createHash('sha256').update(content).digest('hex')
}

export function formatDate(date: Date | null): string {
  if (!date) return 'N/A'
  return new Intl.DateTimeFormat('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (minutes < 60) return `${minutes}m ${secs}s`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m ${secs}s`
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PASSED: 'Aprobado',
    FAILED: 'Fallido',
    BLOCKED: 'Bloqueado',
    SKIPPED: 'Omitido',
    NOT_STARTED: 'Pendiente',
    IN_PROGRESS: 'En Progreso',
    DRAFT: 'Borrador',
    REVIEW: 'En Revision',
    APPROVED: 'Aprobado',
    REJECTED: 'Rechazado',
    ARCHIVED: 'Archivado',
  }
  return labels[status] || status
}

export function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    CRITICAL: 'Critico',
    HIGH: 'Alto',
    MEDIUM: 'Medio',
    LOW: 'Bajo',
  }
  return labels[priority] || priority
}
