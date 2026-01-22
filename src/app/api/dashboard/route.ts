import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/dashboard - Obtener datos del dashboard
export async function GET() {
  try {
    // Obtener estadísticas generales
    const [
      totalSessions,
      activeSessions,
      completedSessions,
      totalTestCases,
      recentExecutions,
      recentSessions,
    ] = await Promise.all([
      prisma.auditSession.count(),
      prisma.auditSession.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.auditSession.count({ where: { status: 'APPROVED' } }),
      prisma.testCase.count(),
      prisma.testExecution.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          testCase: true,
          executedBy: true,
          session: true,
        },
      }),
      prisma.auditSession.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          auditor: true,
          testPlan: true,
        },
      }),
    ])

    // Calcular métricas de ejecución
    const allExecutions = await prisma.testExecution.findMany()
    const passedCount = allExecutions.filter(e => e.status === 'PASSED').length
    const failedCount = allExecutions.filter(e => e.status === 'FAILED').length
    const blockedCount = allExecutions.filter(e => e.status === 'BLOCKED').length
    const totalExecuted = allExecutions.length

    const successRate = totalExecuted > 0
      ? Math.round((passedCount / totalExecuted) * 100)
      : 0

    // Obtener actividad por día (últimos 7 días)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentActivity = await prisma.auditLog.findMany({
      where: {
        timestamp: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 20,
      include: {
        user: true,
      },
    })

    return NextResponse.json({
      stats: {
        totalSessions,
        activeSessions,
        completedSessions,
        totalTestCases,
        totalExecuted,
        passedCount,
        failedCount,
        blockedCount,
        successRate,
      },
      recentSessions,
      recentExecutions,
      recentActivity,
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Error al obtener datos del dashboard' },
      { status: 500 }
    )
  }
}
