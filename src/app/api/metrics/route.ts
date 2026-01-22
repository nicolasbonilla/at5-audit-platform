import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Obtener todas las ejecuciones
    const executions = await prisma.testExecution.findMany({
      include: {
        testCase: {
          include: {
            testSuite: true
          }
        },
        executedBy: {
          select: { id: true, name: true, role: true }
        }
      }
    })

    // Obtener todas las sesiones
    const sessions = await prisma.auditSession.findMany({
      select: {
        id: true,
        passedCount: true,
        failedCount: true,
        blockedCount: true,
        skippedCount: true,
        totalCount: true,
        createdAt: true
      }
    })

    // Calcular métricas generales
    const totalExecuted = executions.length
    const passed = executions.filter(e => e.status === 'PASSED').length
    const failed = executions.filter(e => e.status === 'FAILED').length
    const blocked = executions.filter(e => e.status === 'BLOCKED').length
    const skipped = executions.filter(e => e.status === 'SKIPPED').length

    const successRate = totalExecuted > 0 ? (passed / totalExecuted) * 100 : 0

    // Calcular tiempo promedio (en minutos)
    const executionsWithDuration = executions.filter(e => e.duration && e.duration > 0)
    const avgDuration = executionsWithDuration.length > 0
      ? executionsWithDuration.reduce((sum, e) => sum + (e.duration || 0), 0) / executionsWithDuration.length / 60
      : 0

    // Métricas por categoría (test suite)
    const categoryMap = new Map<string, { total: number; passed: number; failed: number; blocked: number }>()

    executions.forEach(exec => {
      const suiteName = exec.testCase?.testSuite?.name || 'Sin categoría'
      const current = categoryMap.get(suiteName) || { total: 0, passed: 0, failed: 0, blocked: 0 }
      current.total++
      if (exec.status === 'PASSED') current.passed++
      if (exec.status === 'FAILED') current.failed++
      if (exec.status === 'BLOCKED') current.blocked++
      categoryMap.set(suiteName, current)
    })

    const categoryMetrics = Array.from(categoryMap.entries()).map(([name, data]) => ({
      name,
      total: data.total,
      passed: data.passed,
      failed: data.failed,
      blocked: data.blocked,
      rate: data.total > 0 ? (data.passed / data.total) * 100 : 0
    }))

    // Métricas por auditor
    const auditorMap = new Map<string, { name: string; role: string; cases: number; totalTime: number; passed: number }>()

    executions.forEach(exec => {
      if (exec.executedBy) {
        const auditorId = exec.executedBy.id
        const current = auditorMap.get(auditorId) || {
          name: exec.executedBy.name,
          role: exec.executedBy.role,
          cases: 0,
          totalTime: 0,
          passed: 0
        }
        current.cases++
        current.totalTime += exec.duration || 0
        if (exec.status === 'PASSED') current.passed++
        auditorMap.set(auditorId, current)
      }
    })

    const auditorPerformance = Array.from(auditorMap.values())
      .map(auditor => ({
        name: auditor.name,
        role: auditor.role,
        cases: auditor.cases,
        avgTime: auditor.cases > 0 ? (auditor.totalTime / auditor.cases / 60) : 0,
        successRate: auditor.cases > 0 ? (auditor.passed / auditor.cases) * 100 : 0
      }))
      .sort((a, b) => b.successRate - a.successRate)

    // Actividad reciente (últimos 7 días)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentExecutions = executions.filter(e => new Date(e.createdAt) >= sevenDaysAgo)

    const dailyMap = new Map<string, { sessions: Set<string>; cases: number; passed: number; failed: number }>()

    recentExecutions.forEach(exec => {
      const dateStr = new Date(exec.createdAt).toISOString().split('T')[0]
      const current = dailyMap.get(dateStr) || { sessions: new Set(), cases: 0, passed: 0, failed: 0 }
      current.sessions.add(exec.sessionId)
      current.cases++
      if (exec.status === 'PASSED') current.passed++
      if (exec.status === 'FAILED') current.failed++
      dailyMap.set(dateStr, current)
    })

    const recentActivity = Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        sessions: data.sessions.size,
        cases: data.cases,
        passed: data.passed,
        failed: data.failed
      }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5)

    // Calcular cobertura de pruebas
    const totalTestCases = await prisma.testCase.count()
    const executedTestCaseIds = new Set(executions.map(e => e.testCaseId))
    const coverage = totalTestCases > 0 ? (executedTestCaseIds.size / totalTestCases) * 100 : 0

    return NextResponse.json({
      overview: {
        totalExecuted,
        passed,
        failed,
        blocked,
        skipped,
        successRate: Number(successRate.toFixed(1)),
        avgDuration: Number(avgDuration.toFixed(1)),
        defectsFound: failed
      },
      categoryMetrics,
      auditorPerformance,
      recentActivity,
      kpis: {
        coverage: Number(coverage.toFixed(1)),
        totalTestCases,
        executedTestCases: executedTestCaseIds.size,
        totalSessions: sessions.length
      }
    })
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return NextResponse.json(
      { error: 'Error al obtener las métricas' },
      { status: 500 }
    )
  }
}
