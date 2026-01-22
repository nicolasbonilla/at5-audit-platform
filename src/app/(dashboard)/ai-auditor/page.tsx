'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Bot,
  Play,
  Pause,
  Square,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Cpu,
  Zap,
  Settings,
  ChevronRight,
  Loader2,
  ListChecks,
  Activity,
  ThumbsUp,
  ThumbsDown,
  Hand,
} from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

interface AIAuditRun {
  id: string
  runNumber: number
  sessionId: string
  sessionName: string
  status: string
  mode: string
  progress: {
    total: number
    completed: number
    passed: number
    failed: number
    blocked: number
    skipped: number
    percentComplete: number
  }
  config: {
    id: string
    name: string
    provider: string
    model: string
  } | null
  metrics: {
    durationMs: number | null
    tokensUsed: number
    estimatedCost: number
  }
  startedAt: string | null
  completedAt: string | null
  createdAt: string
}

interface QueueStats {
  pending: number
  active: number
  completed: number
  failed: number
  maxConcurrent: number
  isProcessing: boolean
}

interface PendingConfirmation {
  id: string
  runId: string
  type: string
  action: string
  context: string
  aiExplanation: string
  expiresAt: string
  createdAt: string
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function AIAuditorPage() {
  const [runs, setRuns] = useState<AIAuditRun[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRun, setSelectedRun] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [pendingConfirmations, setPendingConfirmations] = useState<PendingConfirmation[]>([])
  const [confirmationLoading, setConfirmationLoading] = useState<string | null>(null)

  // Mock queue stats for now - would come from API
  const queueStats: QueueStats = {
    pending: runs.filter(r => r.status === 'PENDING').length,
    active: runs.filter(r => ['RUNNING', 'INITIALIZING', 'WAITING_CONFIRMATION'].includes(r.status)).length,
    completed: runs.filter(r => r.status === 'COMPLETED').length,
    failed: runs.filter(r => ['FAILED', 'CANCELLED', 'TIMEOUT'].includes(r.status)).length,
    maxConcurrent: 3,
    isProcessing: true,
  }

  // Fetch runs
  const fetchRuns = useCallback(async () => {
    try {
      const res = await fetch('/api/ai-auditor')
      if (!res.ok) throw new Error('Error al cargar las ejecuciones')
      const data = await res.json()
      if (data.success) {
        setRuns(data.data)
      } else {
        throw new Error(data.error?.message || 'Error desconocido')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch pending confirmations
  const fetchConfirmations = useCallback(async () => {
    try {
      const res = await fetch('/api/ai-auditor/confirmations')
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setPendingConfirmations(data.data || [])
        }
      }
    } catch (err) {
      console.error('Error fetching confirmations:', err)
    }
  }, [])

  // Handle confirmation response
  const handleConfirmation = async (confirmationId: string, response: 'APPROVE' | 'REJECT' | 'MANUAL') => {
    setConfirmationLoading(confirmationId)
    try {
      const res = await fetch(`/api/ai-auditor/confirmations/${confirmationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response }),
      })
      if (!res.ok) throw new Error('Error al responder')
      await fetchConfirmations()
      await fetchRuns()
    } catch (err) {
      console.error('Error responding to confirmation:', err)
    } finally {
      setConfirmationLoading(null)
    }
  }

  useEffect(() => {
    fetchRuns()
    fetchConfirmations()
    // Auto-refresh every 5 seconds for active runs
    const interval = setInterval(() => {
      fetchRuns()
      fetchConfirmations()
    }, 5000)
    return () => clearInterval(interval)
  }, [fetchRuns, fetchConfirmations])

  // Run actions
  const handleRunAction = async (runId: string, action: 'PAUSE' | 'RESUME' | 'CANCEL') => {
    setActionLoading(runId)
    try {
      const res = await fetch(`/api/ai-auditor/${runId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) throw new Error('Error al ejecutar la accion')
      await fetchRuns()
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  // Status helpers
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      PENDING: 'bg-gray-100 text-gray-700',
      INITIALIZING: 'bg-blue-100 text-blue-700',
      RUNNING: 'bg-green-100 text-green-700',
      PAUSED: 'bg-yellow-100 text-yellow-700',
      WAITING_CONFIRMATION: 'bg-orange-100 text-orange-700',
      COMPLETING: 'bg-blue-100 text-blue-700',
      COMPLETED: 'bg-green-100 text-green-700',
      FAILED: 'bg-red-100 text-red-700',
      CANCELLED: 'bg-gray-100 text-gray-700',
      TIMEOUT: 'bg-red-100 text-red-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RUNNING':
      case 'INITIALIZING':
        return <Loader2 className="w-4 h-4 animate-spin" />
      case 'COMPLETED':
        return <CheckCircle2 className="w-4 h-4" />
      case 'FAILED':
      case 'TIMEOUT':
        return <XCircle className="w-4 h-4" />
      case 'PAUSED':
        return <Pause className="w-4 h-4" />
      case 'WAITING_CONFIRMATION':
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getModeLabel = (mode: string): string => {
    const labels: Record<string, string> = {
      AUTOMATIC: 'Automatico',
      SEMI_AUTOMATIC: 'Semi-Automatico',
      ASSISTED: 'Asistido',
      DRY_RUN: 'Simulacion',
    }
    return labels[mode] || mode
  }

  const formatDuration = (ms: number | null): string => {
    if (!ms) return '--'
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }

  const formatCost = (cost: number): string => {
    return `$${cost.toFixed(4)}`
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
          <Button onClick={fetchRuns} className="mt-4" variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Bot className="w-8 h-8 text-teal-600" />
            AI Auditor
          </h1>
          <p className="text-muted-foreground mt-1">
            Sistema de auditoria automatizada con inteligencia artificial
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchRuns}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Configuracion
          </Button>
        </div>
      </div>

      {/* Pending Confirmations */}
      {pendingConfirmations.length > 0 && (
        <Card className="border-orange-300 bg-orange-50 dark:bg-orange-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <AlertTriangle className="w-5 h-5" />
              Confirmaciones Pendientes ({pendingConfirmations.length})
            </CardTitle>
            <CardDescription>
              El AI Auditor necesita tu aprobacion para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingConfirmations.map(confirmation => (
                <div
                  key={confirmation.id}
                  className="p-4 rounded-lg border bg-white dark:bg-gray-800"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{confirmation.type}</Badge>
                        <span className="text-sm text-muted-foreground">
                          Expira: {new Date(confirmation.expiresAt).toLocaleTimeString('es-CL')}
                        </span>
                      </div>
                      <h4 className="font-medium mb-1">{confirmation.action}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{confirmation.context}</p>
                      <p className="text-sm bg-gray-100 dark:bg-gray-700 p-2 rounded">
                        <Bot className="w-4 h-4 inline mr-1" />
                        {confirmation.aiExplanation}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleConfirmation(confirmation.id, 'APPROVE')}
                      disabled={confirmationLoading === confirmation.id}
                    >
                      {confirmationLoading === confirmation.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          Aprobar
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleConfirmation(confirmation.id, 'REJECT')}
                      disabled={confirmationLoading === confirmation.id}
                    >
                      <ThumbsDown className="w-4 h-4 mr-1" />
                      Rechazar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleConfirmation(confirmation.id, 'MANUAL')}
                      disabled={confirmationLoading === confirmation.id}
                    >
                      <Hand className="w-4 h-4 mr-1" />
                      Manual
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Queue Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En Cola</p>
                <p className="text-2xl font-bold">{queueStats.pending}</p>
              </div>
              <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
                <ListChecks className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Activas</p>
                <p className="text-2xl font-bold text-green-600">{queueStats.active}</p>
              </div>
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completadas</p>
                <p className="text-2xl font-bold text-blue-600">{queueStats.completed}</p>
              </div>
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fallidas</p>
                <p className="text-2xl font-bold text-red-600">{queueStats.failed}</p>
              </div>
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Runs */}
      {runs.filter(r => ['RUNNING', 'INITIALIZING', 'WAITING_CONFIRMATION', 'PAUSED'].includes(r.status)).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Ejecuciones Activas
            </CardTitle>
            <CardDescription>
              Auditorias AI en progreso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {runs
                .filter(r => ['RUNNING', 'INITIALIZING', 'WAITING_CONFIRMATION', 'PAUSED'].includes(r.status))
                .map(run => (
                  <div
                    key={run.id}
                    className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">Run #{run.runNumber}</h3>
                          <Badge className={getStatusColor(run.status)}>
                            {getStatusIcon(run.status)}
                            <span className="ml-1">{run.status}</span>
                          </Badge>
                          <Badge variant="outline">{getModeLabel(run.mode)}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Sesion: {run.sessionName}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {run.status === 'RUNNING' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRunAction(run.id, 'PAUSE')}
                            disabled={actionLoading === run.id}
                          >
                            {actionLoading === run.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Pause className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                        {run.status === 'PAUSED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRunAction(run.id, 'RESUME')}
                            disabled={actionLoading === run.id}
                          >
                            {actionLoading === run.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRunAction(run.id, 'CANCEL')}
                          disabled={actionLoading === run.id}
                        >
                          <Square className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progreso: {run.progress.completed}/{run.progress.total} casos</span>
                        <span className="font-medium">{run.progress.percentComplete}%</span>
                      </div>
                      <Progress value={run.progress.percentComplete} className="h-2" />
                      <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="w-3 h-3" /> {run.progress.passed} pasados
                        </span>
                        <span className="flex items-center gap-1 text-red-600">
                          <XCircle className="w-3 h-3" /> {run.progress.failed} fallidos
                        </span>
                        <span className="flex items-center gap-1 text-yellow-600">
                          <AlertTriangle className="w-3 h-3" /> {run.progress.blocked} bloqueados
                        </span>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="flex items-center gap-6 mt-3 pt-3 border-t text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDuration(run.metrics.durationMs)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Cpu className="w-4 h-4" />
                        {run.metrics.tokensUsed.toLocaleString()} tokens
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="w-4 h-4" />
                        {formatCost(run.metrics.estimatedCost)}
                      </span>
                      {run.config && (
                        <span className="flex items-center gap-1">
                          <Bot className="w-4 h-4" />
                          {run.config.provider} / {run.config.model}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Run History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-teal-600" />
            Historial de Ejecuciones
          </CardTitle>
          <CardDescription>
            Todas las ejecuciones de AI Auditor
          </CardDescription>
        </CardHeader>
        <CardContent>
          {runs.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No hay ejecuciones de AI Auditor
              </h3>
              <p className="text-muted-foreground mb-4">
                Inicie una nueva auditoria automatizada desde una sesion de auditoria
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Run</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Sesion</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Estado</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Modo</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Progreso</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Resultados</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Duracion</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Costo</th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map(run => (
                    <tr
                      key={run.id}
                      className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => setSelectedRun(selectedRun === run.id ? null : run.id)}
                    >
                      <td className="py-3 px-4 font-medium">#{run.runNumber}</td>
                      <td className="py-3 px-4">{run.sessionName}</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(run.status)}>
                          {getStatusIcon(run.status)}
                          <span className="ml-1">{run.status}</span>
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{getModeLabel(run.mode)}</Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Progress value={run.progress.percentComplete} className="w-20 h-2" />
                          <span className="text-sm">{run.progress.percentComplete}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-3 text-sm">
                          <span className="text-green-600">{run.progress.passed}</span>
                          <span className="text-gray-400">/</span>
                          <span className="text-red-600">{run.progress.failed}</span>
                          <span className="text-gray-400">/</span>
                          <span className="text-yellow-600">{run.progress.blocked}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-sm">
                        {formatDuration(run.metrics.durationMs)}
                      </td>
                      <td className="py-3 px-4 text-right text-sm">
                        {formatCost(run.metrics.estimatedCost)}
                      </td>
                      <td className="py-3 px-4">
                        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${selectedRun === run.id ? 'rotate-90' : ''}`} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How to Start */}
      <Card className="bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 border-teal-200 dark:border-teal-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-teal-100 dark:bg-teal-900">
              <Bot className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Como iniciar una auditoria con AI</h3>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Ve a una sesion de auditoria existente o crea una nueva</li>
                <li>Selecciona los casos de prueba que deseas auditar automaticamente</li>
                <li>Haz clic en el boton &quot;Iniciar AI Auditor&quot;</li>
                <li>Selecciona el modo de ejecucion (Automatico, Semi-automatico, etc.)</li>
                <li>Monitorea el progreso y responde a las solicitudes de confirmacion</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
