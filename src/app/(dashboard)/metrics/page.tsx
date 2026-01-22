'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  Target,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  Calendar,
  Zap,
  Award,
  Loader2
} from 'lucide-react'

interface MetricsData {
  overview: {
    totalExecuted: number
    passed: number
    failed: number
    blocked: number
    skipped: number
    successRate: number
    avgDuration: number
    defectsFound: number
  }
  categoryMetrics: Array<{
    name: string
    total: number
    passed: number
    failed: number
    blocked: number
    rate: number
  }>
  auditorPerformance: Array<{
    name: string
    role: string
    cases: number
    avgTime: number
    successRate: number
  }>
  recentActivity: Array<{
    date: string
    sessions: number
    cases: number
    passed: number
    failed: number
  }>
  kpis: {
    coverage: number
    totalTestCases: number
    executedTestCases: number
    totalSessions: number
  }
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMetrics()
  }, [])

  async function fetchMetrics() {
    try {
      const res = await fetch('/api/metrics')
      if (!res.ok) {
        throw new Error('Error al cargar las metricas')
      }
      const data = await res.json()
      setMetrics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return null
  }

  const { overview, categoryMetrics, auditorPerformance, recentActivity, kpis } = metrics

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Metricas y Analisis</h1>
        <p className="text-muted-foreground mt-1">
          Dashboard analitico del proceso de auditoria AT5 MCP
        </p>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Casos Ejecutados</p>
                <p className="text-3xl font-bold mt-1">{overview.totalExecuted}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-green-600">{overview.passed} pasados</span>
                  <span className="text-sm text-red-600">{overview.failed} fallidos</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                <CheckCircle2 className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tasa de Exito</p>
                <p className={`text-3xl font-bold mt-1 ${getRateColor(overview.successRate)}`}>
                  {overview.successRate}%
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {overview.passed} de {overview.totalExecuted} casos
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                <Target className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tiempo Promedio</p>
                <p className="text-3xl font-bold mt-1">{overview.avgDuration} min</p>
                <p className="text-sm text-muted-foreground mt-2">
                  por caso de prueba
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                <Clock className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Defectos Encontrados</p>
                <p className="text-3xl font-bold mt-1 text-red-600">{overview.defectsFound}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {overview.blocked} bloqueados
                </p>
              </div>
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-900">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-300" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-teal-600" />
              Rendimiento por Categoria
            </CardTitle>
            <CardDescription>
              Tasa de exito en cada categoria de pruebas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {categoryMetrics.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No hay datos de categorias disponibles
              </p>
            ) : (
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
            )}
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
              Estadisticas individuales del equipo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {auditorPerformance.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No hay datos de auditores disponibles
              </p>
            ) : (
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
                        <span>{auditor.avgTime.toFixed(1)} min/caso</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${getRateColor(auditor.successRate)}`}>
                        {auditor.successRate.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground">tasa de exito</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
            Resumen de los ultimos 5 dias de auditoria
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay actividad reciente
            </p>
          ) : (
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
                    const rate = day.cases > 0 ? (day.passed / day.cases) * 100 : 0
                    return (
                      <tr key={day.date} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-3 px-4 font-medium">{day.date}</td>
                        <td className="py-3 px-4 text-center">{day.sessions}</td>
                        <td className="py-3 px-4 text-center">{day.cases}</td>
                        <td className="py-3 px-4 text-center text-green-600">{day.passed}</td>
                        <td className="py-3 px-4 text-center text-red-600">{day.failed}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={rate >= 90 ? 'bg-green-100 text-green-700' : rate >= 70 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}>
                            {rate.toFixed(1)}%
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* KPIs Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Award className="w-12 h-12 opacity-80" />
              <div>
                <p className="text-teal-100 text-sm">Cobertura de Pruebas</p>
                <p className="text-3xl font-bold">{kpis.coverage}%</p>
                <p className="text-teal-100 text-xs mt-1">
                  {kpis.executedTestCases}/{kpis.totalTestCases} casos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Zap className="w-12 h-12 opacity-80" />
              <div>
                <p className="text-purple-100 text-sm">Total Sesiones</p>
                <p className="text-3xl font-bold">{kpis.totalSessions}</p>
                <p className="text-purple-100 text-xs mt-1">sesiones de auditoria</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Target className="w-12 h-12 opacity-80" />
              <div>
                <p className="text-blue-100 text-sm">Tasa de Exito Global</p>
                <p className="text-3xl font-bold">{overview.successRate}%</p>
                <p className="text-blue-100 text-xs mt-1">
                  {overview.passed} aprobados de {overview.totalExecuted}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
