import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import {
  ExecutionStatusPieChart,
  SessionProgressBarChart,
  ExecutionTrendChart,
  SuccessRateGauge,
  PriorityDistributionChart,
} from '@/components/dashboard/charts'
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowRight,
  TrendingUp,
  Users,
  FileText,
  Activity,
  BarChart3,
  Shield,
  Calendar
} from 'lucide-react'

function getStatusBadge(status: string) {
  switch (status) {
    case 'IN_PROGRESS':
      return <Badge className="bg-blue-100 text-blue-700">En Progreso</Badge>
    case 'REVIEW':
      return <Badge className="bg-yellow-100 text-yellow-700">En Revisión</Badge>
    case 'APPROVED':
    case 'COMPLETED':
      return <Badge className="bg-green-100 text-green-700">Completado</Badge>
    case 'DRAFT':
      return <Badge className="bg-gray-100 text-gray-700">Borrador</Badge>
    default:
      return <Badge>{status}</Badge>
  }
}

async function getDashboardData() {
  const [
    sessions,
    allExecutions,
    totalTestCases,
    users,
    testPlans,
    recentLogs,
    signatures,
  ] = await Promise.all([
    prisma.auditSession.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        auditor: { select: { name: true } },
        testPlan: { select: { title: true } },
      },
    }),
    prisma.testExecution.findMany({
      include: {
        testCase: { select: { priority: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.testCase.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.testPlan.count(),
    prisma.auditLog.findMany({
      take: 10,
      orderBy: { timestamp: 'desc' },
      include: {
        user: { select: { name: true } },
      },
    }),
    prisma.signature.count(),
  ])

  // Calcular estadísticas
  const activeSessions = sessions.filter((s) => s.status === 'IN_PROGRESS').length
  const reviewSessions = sessions.filter((s) => s.status === 'REVIEW').length
  const completedSessions = sessions.filter((s) =>
    ['APPROVED', 'COMPLETED'].includes(s.status)
  ).length

  const passedCount = allExecutions.filter((e) => e.status === 'PASSED').length
  const failedCount = allExecutions.filter((e) => e.status === 'FAILED').length
  const blockedCount = allExecutions.filter((e) => e.status === 'BLOCKED').length
  const skippedCount = allExecutions.filter((e) => e.status === 'SKIPPED').length
  const totalExecuted = passedCount + failedCount + blockedCount + skippedCount
  const pendingCount = totalTestCases - totalExecuted

  const successRate =
    passedCount + failedCount > 0
      ? Math.round((passedCount / (passedCount + failedCount)) * 100)
      : 0

  const overallProgress =
    totalTestCases > 0 ? Math.round((totalExecuted / totalTestCases) * 100) : 0

  // Datos para gráfico de progreso por sesión
  const sessionProgressData = sessions
    .filter((s) => s.status === 'IN_PROGRESS')
    .slice(0, 5)
    .map((s) => ({
      name: s.name.length > 20 ? s.name.substring(0, 20) + '...' : s.name,
      progress: s.progress,
      passed: s.passedCount,
      failed: s.failedCount,
    }))

  // Datos para tendencia (últimos 7 días)
  const today = new Date()
  const trendData = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const dayExecutions = allExecutions.filter((e) => {
      const execDate = new Date(e.createdAt).toISOString().split('T')[0]
      return execDate === dateStr
    })
    trendData.push({
      date: date.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }),
      passed: dayExecutions.filter((e) => e.status === 'PASSED').length,
      failed: dayExecutions.filter((e) => e.status === 'FAILED').length,
      total: dayExecutions.length,
    })
  }

  // Distribución por prioridad
  const priorityDistribution = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((priority) => ({
    priority,
    count: allExecutions.filter((e) => e.testCase.priority === priority).length,
  }))

  return {
    sessions: sessions.slice(0, 5),
    stats: {
      activeSessions,
      reviewSessions,
      completedSessions,
      passedCount,
      failedCount,
      blockedCount,
      skippedCount,
      pendingCount,
      totalExecuted,
      totalTestCases,
      overallProgress,
      successRate,
      users,
      testPlans,
      signatures,
      totalSessions: sessions.length,
    },
    sessionProgressData,
    trendData,
    priorityDistribution,
    recentLogs,
  }
}

export default async function DashboardPage() {
  const [authSession, dashboardData] = await Promise.all([auth(), getDashboardData()])

  const { sessions, stats, sessionProgressData, trendData, priorityDistribution, recentLogs } =
    dashboardData
  const userName = authSession?.user?.name || 'Usuario'

  const mainStatCards = [
    {
      label: 'Sesiones Activas',
      value: stats.activeSessions,
      icon: ClipboardCheck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Tasa de Éxito',
      value: `${stats.successRate}%`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'En Revisión',
      value: stats.reviewSessions,
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      label: 'Completadas',
      value: stats.completedSessions,
      icon: CheckCircle2,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
    },
  ]

  const secondaryStats = [
    { label: 'Usuarios Activos', value: stats.users, icon: Users },
    { label: 'Planes de Prueba', value: stats.testPlans, icon: FileText },
    { label: 'Total Sesiones', value: stats.totalSessions, icon: Activity },
    { label: 'Firmas Registradas', value: stats.signatures, icon: Shield },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido, {userName}. Sistema de auditoría AT5 MCP
          </p>
        </div>
        <Button asChild>
          <Link href="/sessions/new">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Auditoría
          </Link>
        </Button>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mainStatCards.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Execution Status Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-teal-600" />
              Estado de Ejecuciones
            </CardTitle>
            <CardDescription>Distribución de resultados de pruebas</CardDescription>
          </CardHeader>
          <CardContent>
            <ExecutionStatusPieChart
              data={{
                passed: stats.passedCount,
                failed: stats.failedCount,
                blocked: stats.blockedCount,
                skipped: stats.skippedCount,
                pending: stats.pendingCount,
              }}
            />
          </CardContent>
        </Card>

        {/* Success Rate Gauge */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              Tasa de Éxito Global
            </CardTitle>
            <CardDescription>
              Pruebas aprobadas vs fallidas (sin pendientes)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SuccessRateGauge rate={stats.successRate} />
            <div className="grid grid-cols-2 gap-4 mt-4 text-center text-sm">
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.passedCount}</div>
                <div className="text-muted-foreground">Aprobadas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{stats.failedCount}</div>
                <div className="text-muted-foreground">Fallidas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-teal-600" />
              Distribución por Prioridad
            </CardTitle>
            <CardDescription>Ejecuciones por nivel de prioridad</CardDescription>
          </CardHeader>
          <CardContent>
            <PriorityDistributionChart data={priorityDistribution} />
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart & Session Progress */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Execution Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              Tendencia de Ejecución (7 días)
            </CardTitle>
            <CardDescription>Evolución de pruebas ejecutadas</CardDescription>
          </CardHeader>
          <CardContent>
            <ExecutionTrendChart data={trendData} />
          </CardContent>
        </Card>

        {/* Session Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-600" />
              Progreso de Sesiones Activas
            </CardTitle>
            <CardDescription>Avance de auditorías en curso</CardDescription>
          </CardHeader>
          <CardContent>
            <SessionProgressBarChart data={sessionProgressData} />
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {secondaryStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <stat.icon className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Sessions & Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Sessions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Sesiones Recientes</CardTitle>
                <CardDescription>Últimas auditorías en el sistema</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/sessions">
                  Ver todas
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ClipboardCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay sesiones de auditoría</p>
                  <Button asChild className="mt-4">
                    <Link href="/sessions/new">Crear primera sesión</Link>
                  </Button>
                </div>
              ) : (
                sessions.map((session) => (
                  <Link
                    key={session.id}
                    href={`/sessions/${session.id}`}
                    className="block p-4 rounded-lg border hover:border-teal-200 hover:bg-teal-50/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{session.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {session.auditor?.name || 'Sin asignar'}
                        </p>
                      </div>
                      {getStatusBadge(session.status)}
                    </div>
                    <div className="space-y-2">
                      <Progress value={session.progress} className="h-2" />
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{session.progress}% completado</span>
                        <span className="flex items-center gap-2">
                          <span className="text-green-600">{session.passedCount}</span>/
                          <span className="text-red-600">{session.failedCount}</span>/
                          <span>{session.totalCount}</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>Últimas acciones registradas</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/audit-log">
                  Ver logs
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay actividad reciente</p>
                </div>
              ) : (
                recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-gray-50/50"
                  >
                    <div className="p-1.5 bg-white rounded border">
                      <Activity className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{log.action}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {log.details || log.entity}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {log.user?.name || 'Sistema'} -{' '}
                        {new Date(log.timestamp).toLocaleString('es-CL', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href={sessions[0] ? `/sessions/${sessions[0].id}/execute` : '/sessions/new'}>
          <Card className="cursor-pointer hover:border-teal-200 transition-colors h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-teal-600" />
                Continuar Auditoría
              </CardTitle>
              <CardDescription>
                {sessions[0]
                  ? `Retoma la sesión "${sessions[0].name}" donde la dejaste.`
                  : 'Crea tu primera sesión de auditoría.'}
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/sessions?status=IN_PROGRESS">
          <Card className="cursor-pointer hover:border-teal-200 transition-colors h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Revisar Defectos
              </CardTitle>
              <CardDescription>
                {stats.failedCount > 0
                  ? `Hay ${stats.failedCount} casos de prueba fallidos que requieren atención.`
                  : 'No hay defectos pendientes de revisión.'}
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/sessions?status=REVIEW">
          <Card className="cursor-pointer hover:border-teal-200 transition-colors h-full">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Aprobar Sesión
              </CardTitle>
              <CardDescription>
                {stats.reviewSessions > 0
                  ? `${stats.reviewSessions} sesión(es) lista(s) para aprobación.`
                  : 'No hay sesiones pendientes de aprobación.'}
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  )
}
