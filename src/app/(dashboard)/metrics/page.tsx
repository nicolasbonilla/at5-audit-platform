'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MinusCircle,
  Users,
  Calendar,
  Zap,
  Award
} from 'lucide-react'

interface MetricCard {
  title: string
  value: string | number
  change: number
  changeLabel: string
  icon: React.ReactNode
  color: string
}

const overviewMetrics: MetricCard[] = [
  {
    title: 'Total Casos Ejecutados',
    value: 156,
    change: 12,
    changeLabel: 'vs mes anterior',
    icon: <CheckCircle2 className="w-6 h-6" />,
    color: 'blue'
  },
  {
    title: 'Tasa de Éxito',
    value: '94.2%',
    change: 2.3,
    changeLabel: 'vs mes anterior',
    icon: <Target className="w-6 h-6" />,
    color: 'green'
  },
  {
    title: 'Tiempo Promedio',
    value: '4.2 min',
    change: -0.8,
    changeLabel: 'vs mes anterior',
    icon: <Clock className="w-6 h-6" />,
    color: 'purple'
  },
  {
    title: 'Defectos Encontrados',
    value: 8,
    change: -3,
    changeLabel: 'vs mes anterior',
    icon: <XCircle className="w-6 h-6" />,
    color: 'red'
  }
]

const categoryMetrics = [
  { name: 'Proyectos', total: 6, passed: 6, failed: 0, blocked: 0, rate: 100 },
  { name: 'Dispositivos', total: 7, passed: 6, failed: 1, blocked: 0, rate: 85.7 },
  { name: 'Señales', total: 5, passed: 5, failed: 0, blocked: 0, rate: 100 },
  { name: 'Lotes', total: 2, passed: 2, failed: 0, blocked: 0, rate: 100 },
  { name: 'Templates', total: 3, passed: 2, failed: 0, blocked: 1, rate: 66.7 },
  { name: 'Tráfico', total: 3, passed: 3, failed: 0, blocked: 0, rate: 100 },
  { name: 'Reportes', total: 4, passed: 3, failed: 1, blocked: 0, rate: 75 },
  { name: 'Escenarios', total: 3, passed: 3, failed: 0, blocked: 0, rate: 100 },
]

const recentActivity = [
  { date: '2026-01-12', sessions: 3, cases: 24, passed: 22, failed: 2 },
  { date: '2026-01-11', sessions: 2, cases: 18, passed: 17, failed: 1 },
  { date: '2026-01-10', sessions: 4, cases: 31, passed: 30, failed: 1 },
  { date: '2026-01-09', sessions: 2, cases: 15, passed: 15, failed: 0 },
  { date: '2026-01-08', sessions: 3, cases: 28, passed: 26, failed: 2 },
]

const auditorPerformance = [
  { name: 'Dr. García', role: 'Lead Auditor', cases: 45, avgTime: 3.8, successRate: 97.8 },
  { name: 'Ing. López', role: 'Auditor', cases: 62, avgTime: 4.2, successRate: 93.5 },
  { name: 'Dr. Martínez', role: 'Reviewer', cases: 28, avgTime: 5.1, successRate: 96.4 },
]

export default function MetricsPage() {
  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      blue: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-600 dark:text-blue-300' },
      green: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-600 dark:text-green-300' },
      purple: { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-600 dark:text-purple-300' },
      red: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-600 dark:text-red-300' },
    }
    return colors[color] || colors.blue
  }

  const getRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600'
    if (rate >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getProgressColor = (rate: number) => {
    if (rate >= 90) return 'bg-green-500'
    if (rate >= 70) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Métricas y Análisis</h1>
        <p className="text-muted-foreground mt-1">
          Dashboard analítico del proceso de auditoría AT5 MCP
        </p>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewMetrics.map((metric) => {
          const colors = getColorClasses(metric.color)
          return (
            <Card key={metric.title}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.title}</p>
                    <p className="text-3xl font-bold mt-1">{metric.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {metric.change > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`text-sm ${metric.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {metric.change > 0 ? '+' : ''}{metric.change}%
                      </span>
                      <span className="text-xs text-muted-foreground">{metric.changeLabel}</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full ${colors.bg}`}>
                    <div className={colors.text}>{metric.icon}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-teal-600" />
              Rendimiento por Categoría
            </CardTitle>
            <CardDescription>
              Tasa de éxito en cada categoría de pruebas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryMetrics.map((cat) => (
                <div key={cat.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{cat.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {cat.passed}/{cat.total} pasados
                      </span>
                      <span className={`font-semibold ${getRateColor(cat.rate)}`}>
                        {cat.rate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getProgressColor(cat.rate)} transition-all`}
                      style={{ width: `${cat.rate}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="w-3 h-3" /> {cat.passed}
                    </span>
                    <span className="flex items-center gap-1 text-red-600">
                      <XCircle className="w-3 h-3" /> {cat.failed}
                    </span>
                    <span className="flex items-center gap-1 text-yellow-600">
                      <AlertTriangle className="w-3 h-3" /> {cat.blocked}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Auditor Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" />
              Rendimiento de Auditores
            </CardTitle>
            <CardDescription>
              Estadísticas individuales del equipo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {auditorPerformance.map((auditor, index) => (
                <div key={auditor.name} className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-300 font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{auditor.name}</p>
                      <Badge variant="outline" className="text-xs">{auditor.role}</Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>{auditor.cases} casos</span>
                      <span>{auditor.avgTime} min/caso</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${getRateColor(auditor.successRate)}`}>
                      {auditor.successRate}%
                    </p>
                    <p className="text-xs text-muted-foreground">tasa de éxito</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" />
            Actividad Reciente
          </CardTitle>
          <CardDescription>
            Resumen de los últimos 5 días de auditoría
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Fecha</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Sesiones</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Casos</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Pasados</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Fallidos</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Tasa</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((day) => {
                  const rate = (day.passed / day.cases) * 100
                  return (
                    <tr key={day.date} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4 font-medium">{day.date}</td>
                      <td className="py-3 px-4 text-center">{day.sessions}</td>
                      <td className="py-3 px-4 text-center">{day.cases}</td>
                      <td className="py-3 px-4 text-center text-green-600">{day.passed}</td>
                      <td className="py-3 px-4 text-center text-red-600">{day.failed}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={rate >= 90 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                          {rate.toFixed(1)}%
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* KPIs Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Award className="w-12 h-12 opacity-80" />
              <div>
                <p className="text-teal-100 text-sm">Cumplimiento ISO 29119</p>
                <p className="text-3xl font-bold">98.5%</p>
                <p className="text-teal-100 text-xs mt-1">Objetivo: 95%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Zap className="w-12 h-12 opacity-80" />
              <div>
                <p className="text-purple-100 text-sm">Eficiencia de Ejecución</p>
                <p className="text-3xl font-bold">87.3%</p>
                <p className="text-purple-100 text-xs mt-1">+5.2% este mes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Target className="w-12 h-12 opacity-80" />
              <div>
                <p className="text-blue-100 text-sm">Cobertura de Pruebas</p>
                <p className="text-3xl font-bold">91.2%</p>
                <p className="text-blue-100 text-xs mt-1">33/36 herramientas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
