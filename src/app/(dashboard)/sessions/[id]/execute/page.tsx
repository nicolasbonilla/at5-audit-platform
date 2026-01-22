'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MinusCircle,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Upload,
  Image,
  FileText,
  ChevronRight,
  Loader2,
  Trash2,
  Eye,
  File,
  X
} from 'lucide-react'

interface TestCase {
  id: string
  code: string
  name: string
  description: string
  preconditions: string
  steps: string
  expectedResult: string
  priority: string
  testType: string
  estimatedTime: number
  testSuiteId: string
}

interface TestSuite {
  id: string
  name: string
  description: string
  testCases: TestCase[]
}

interface Evidence {
  id: string
  type: string
  fileName: string
  filePath: string
  fileSize: number
  mimeType: string
  hash: string
  description?: string
  uploadedAt: string
}

interface Execution {
  id: string
  status: string
  actualResult: string | null
  testCaseId: string
  evidences?: Evidence[]
}

interface Session {
  id: string
  name: string
  description: string | null
  status: string
  progress: number
  passedCount: number
  failedCount: number
  blockedCount: number
  skippedCount: number
  totalCount: number
  testPlan: {
    id: string
    title: string
    testSuites: TestSuite[]
  } | null
  executions: Execution[]
  auditor: {
    id: string
    name: string
  } | null
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'CRITICAL': return 'text-red-600 bg-red-50'
    case 'HIGH': return 'text-orange-600 bg-orange-50'
    case 'MEDIUM': return 'text-yellow-600 bg-yellow-50'
    case 'LOW': return 'text-gray-600 bg-gray-50'
    default: return 'text-gray-600 bg-gray-50'
  }
}

function getExecutionStatusIcon(status: string | undefined) {
  switch (status) {
    case 'PASSED': return <CheckCircle2 className="w-4 h-4 text-green-600" />
    case 'FAILED': return <XCircle className="w-4 h-4 text-red-600" />
    case 'BLOCKED': return <AlertTriangle className="w-4 h-4 text-yellow-600" />
    case 'SKIPPED': return <MinusCircle className="w-4 h-4 text-gray-400" />
    default: return <Clock className="w-4 h-4 text-gray-400" />
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return <Image className="w-4 h-4" />
  if (mimeType === 'application/pdf') return <FileText className="w-4 h-4" />
  return <File className="w-4 h-4" />
}

export default function ExecuteTestPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [actualResult, setActualResult] = useState('')
  const [notes, setNotes] = useState('')
  const [timer, setTimer] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [executionMap, setExecutionMap] = useState<Map<string, Execution>>(new Map())

  // Evidence states
  const [evidences, setEvidences] = useState<Evidence[]>([])
  const [uploading, setUploading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewEvidence, setPreviewEvidence] = useState<Evidence | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Fetch session data
  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch(`/api/sessions/${sessionId}`)
        if (res.ok) {
          const data = await res.json()
          setSession(data)
          setExecutionMap(new Map(data.executions.map((e: Execution) => [e.testCaseId, e])))

          // Select first pending test case
          if (data.testPlan?.testSuites) {
            const allCases = data.testPlan.testSuites.flatMap((s: TestSuite) => s.testCases)
            const executedIds = new Set(data.executions.map((e: Execution) => e.testCaseId))
            const pendingCase = allCases.find((tc: TestCase) => !executedIds.has(tc.id))
            if (pendingCase) {
              setSelectedTestCase(pendingCase)
            } else if (allCases.length > 0) {
              setSelectedTestCase(allCases[0])
            }
          }
        }
      } catch (error) {
        console.error('Error fetching session:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSession()
  }, [sessionId])

  // Fetch evidences when test case changes
  const fetchEvidences = useCallback(async (executionId: string) => {
    try {
      const res = await fetch(`/api/evidence?executionId=${executionId}`)
      if (res.ok) {
        const data = await res.json()
        setEvidences(data)
      }
    } catch (error) {
      console.error('Error fetching evidences:', error)
    }
  }, [])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(t => t + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning])

  // Reset when selecting new test case
  useEffect(() => {
    if (selectedTestCase) {
      const existingExecution = executionMap.get(selectedTestCase.id)
      if (existingExecution) {
        setActualResult(existingExecution.actualResult || '')
        fetchEvidences(existingExecution.id)
      } else {
        setActualResult('')
        setEvidences([])
      }
      setCompletedSteps(new Set())
      setNotes('')
      setTimer(0)
      setIsTimerRunning(false)
    }
  }, [selectedTestCase, executionMap, fetchEvidences])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const parseSteps = (stepsJson: string): { step: number; description: string }[] => {
    try {
      return JSON.parse(stepsJson)
    } catch {
      return [{ step: 1, description: stepsJson }]
    }
  }

  const toggleStep = (stepNum: number) => {
    const newCompleted = new Set(completedSteps)
    if (newCompleted.has(stepNum)) {
      newCompleted.delete(stepNum)
    } else {
      newCompleted.add(stepNum)
    }
    setCompletedSteps(newCompleted)
  }

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !selectedTestCase) return

    const execution = executionMap.get(selectedTestCase.id)
    if (!execution) {
      alert('Primero debe iniciar la ejecucion del caso de prueba')
      return
    }

    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('executionId', execution.id)

        const res = await fetch('/api/evidence', {
          method: 'POST',
          body: formData,
        })

        if (res.ok) {
          const newEvidence = await res.json()
          setEvidences(prev => [newEvidence, ...prev])
        } else {
          const error = await res.json()
          alert(`Error al subir ${file.name}: ${error.error}`)
        }
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Error al subir archivo')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeleteEvidence = async (evidenceId: string) => {
    if (!confirm('¿Está seguro de eliminar esta evidencia?')) return

    try {
      const res = await fetch(`/api/evidence/${evidenceId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setEvidences(prev => prev.filter(e => e.id !== evidenceId))
      } else {
        const error = await res.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting evidence:', error)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileUpload(e.dataTransfer.files)
  }

  const handleSubmitResult = async (status: 'PASSED' | 'FAILED' | 'BLOCKED' | 'SKIPPED') => {
    if (!selectedTestCase || !session?.auditor) return

    setSaving(true)
    try {
      const res = await fetch('/api/executions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          testCaseId: selectedTestCase.id,
          executorId: session.auditor.id,
          status,
          actualResult,
          notes,
          duration: timer,
        }),
      })

      if (res.ok) {
        // Refresh session data
        const sessionRes = await fetch(`/api/sessions/${sessionId}`)
        if (sessionRes.ok) {
          const data = await sessionRes.json()
          setSession(data)
          setExecutionMap(new Map(data.executions.map((e: Execution) => [e.testCaseId, e])))

          // Move to next pending test case
          if (data.testPlan?.testSuites) {
            const allCases = data.testPlan.testSuites.flatMap((s: TestSuite) => s.testCases)
            const executedIds = new Set(data.executions.map((e: Execution) => e.testCaseId))
            const currentIndex = allCases.findIndex((tc: TestCase) => tc.id === selectedTestCase.id)
            const nextPending = allCases.slice(currentIndex + 1).find((tc: TestCase) => !executedIds.has(tc.id))
            if (nextPending) {
              setSelectedTestCase(nextPending)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error saving execution:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Sesion no encontrada</h2>
        <Button asChild>
          <Link href="/sessions">Volver a Sesiones</Link>
        </Button>
      </div>
    )
  }

  const allTestCases = session.testPlan?.testSuites.flatMap(s => s.testCases) || []
  const steps = selectedTestCase ? parseSteps(selectedTestCase.steps) : []
  const currentExecution = selectedTestCase ? executionMap.get(selectedTestCase.id) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/sessions/${sessionId}`}>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">{session.name}</h1>
            <p className="text-sm text-muted-foreground">Modo de Ejecucion Interactiva</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Progreso</div>
            <div className="font-semibold">{session.progress}%</div>
          </div>
          <Progress value={session.progress} className="w-32 h-2" />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar - Test Case List */}
        <div className="col-span-3">
          <Card className="sticky top-20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Casos de Prueba</CardTitle>
              <CardDescription className="text-xs">
                {session.passedCount + session.failedCount + session.blockedCount + session.skippedCount}/{session.totalCount} ejecutados
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[500px] overflow-y-auto">
                {session.testPlan?.testSuites.map((suite) => (
                  <div key={suite.id}>
                    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-muted-foreground">
                      {suite.name}
                    </div>
                    {suite.testCases.map((tc) => {
                      const execution = executionMap.get(tc.id)
                      const isSelected = selectedTestCase?.id === tc.id
                      return (
                        <button
                          key={tc.id}
                          onClick={() => setSelectedTestCase(tc)}
                          className={`w-full flex items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                            isSelected ? 'bg-teal-50 dark:bg-teal-900/20 border-l-2 border-teal-600' : ''
                          }`}
                        >
                          {getExecutionStatusIcon(execution?.status)}
                          <span className="truncate flex-1">{tc.code}</span>
                          {isSelected && <ChevronRight className="w-4 h-4 text-teal-600" />}
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="col-span-6 space-y-6">
          {selectedTestCase ? (
            <>
              {/* Test Case Info */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono text-teal-600">{selectedTestCase.code}</code>
                        <Badge className={getPriorityColor(selectedTestCase.priority)}>
                          {selectedTestCase.priority}
                        </Badge>
                      </div>
                      <CardTitle className="mt-2">{selectedTestCase.name}</CardTitle>
                    </div>
                    {currentExecution && (
                      <Badge className={
                        currentExecution.status === 'PASSED' ? 'bg-green-100 text-green-700' :
                        currentExecution.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                        currentExecution.status === 'BLOCKED' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }>
                        {currentExecution.status || 'PENDING'}
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{selectedTestCase.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Precondiciones</h4>
                    <p className="text-sm text-muted-foreground">{selectedTestCase.preconditions}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-1">Resultado Esperado</h4>
                    <p className="text-sm text-muted-foreground">{selectedTestCase.expectedResult}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Steps Checklist */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Pasos de Ejecucion</CardTitle>
                  <CardDescription>
                    Marque cada paso a medida que lo complete
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {steps.map((step) => (
                      <div
                        key={step.step}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                          completedSteps.has(step.step)
                            ? 'bg-green-50 border-green-200 dark:bg-green-900/20'
                            : 'bg-gray-50 dark:bg-gray-800'
                        }`}
                      >
                        <Checkbox
                          checked={completedSteps.has(step.step)}
                          onCheckedChange={() => toggleStep(step.step)}
                          className="mt-0.5"
                        />
                        <div className="flex-1">
                          <span className="font-medium text-sm">Paso {step.step}:</span>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Actual Result */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Resultado Actual</CardTitle>
                  <CardDescription>
                    Documente el resultado obtenido durante la ejecucion
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Describa el resultado observado..."
                    value={actualResult}
                    onChange={(e) => setActualResult(e.target.value)}
                    rows={4}
                  />
                  <Textarea
                    placeholder="Notas adicionales (opcional)..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                  />
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Seleccione el resultado de la prueba:
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleSubmitResult('PASSED')}
                        disabled={saving}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                        Aprobado
                      </Button>
                      <Button
                        onClick={() => handleSubmitResult('FAILED')}
                        disabled={saving}
                        variant="destructive"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                        Fallido
                      </Button>
                      <Button
                        onClick={() => handleSubmitResult('BLOCKED')}
                        disabled={saving}
                        variant="outline"
                        className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <AlertTriangle className="w-4 h-4 mr-2" />}
                        Bloqueado
                      </Button>
                      <Button
                        onClick={() => handleSubmitResult('SKIPPED')}
                        disabled={saving}
                        variant="outline"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <MinusCircle className="w-4 h-4 mr-2" />}
                        Omitir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="w-12 h-12 mx-auto text-green-600 mb-4" />
                <h3 className="font-semibold text-lg mb-2">Todos los casos ejecutados</h3>
                <p className="text-muted-foreground mb-4">
                  Has completado todos los casos de prueba de esta sesion
                </p>
                <Button asChild>
                  <Link href={`/sessions/${sessionId}`}>Ver Resumen</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Sidebar - Timer & Quick Stats */}
        <div className="col-span-3 space-y-4">
          {/* Timer */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Cronometro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-mono font-bold text-teal-600 mb-4">
                  {formatTime(timer)}
                </div>
                <div className="flex justify-center gap-2">
                  <Button
                    size="sm"
                    variant={isTimerRunning ? "destructive" : "default"}
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                  >
                    {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setTimer(0); setIsTimerRunning(false); }}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Estadisticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Aprobados
                </span>
                <span className="font-semibold">{session.passedCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm">
                  <XCircle className="w-4 h-4 text-red-600" />
                  Fallidos
                </span>
                <span className="font-semibold">{session.failedCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  Bloqueados
                </span>
                <span className="font-semibold">{session.blockedCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  Pendientes
                </span>
                <span className="font-semibold">
                  {session.totalCount - session.passedCount - session.failedCount - session.blockedCount - session.skippedCount}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Evidence Upload */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Evidencias</CardTitle>
              <CardDescription className="text-xs">
                {currentExecution ? `${evidences.length} archivo(s)` : 'Ejecute primero el caso'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                accept="image/*,.pdf,.txt,.log,.json,.mp4,.webm"
                onChange={(e) => handleFileUpload(e.target.files)}
              />

              <div
                className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                  isDragging ? 'border-teal-500 bg-teal-50' : 'border-gray-300'
                } ${!currentExecution ? 'opacity-50 pointer-events-none' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {uploading ? (
                  <Loader2 className="w-8 h-8 mx-auto text-teal-600 animate-spin mb-2" />
                ) : (
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                )}
                <p className="text-xs text-muted-foreground mb-2">
                  {uploading ? 'Subiendo...' : 'Arrastre archivos aqui o'}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!currentExecution || uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Seleccionar Archivos
                </Button>
              </div>

              {/* Evidence List */}
              {evidences.length > 0 && (
                <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                  {evidences.map((evidence) => (
                    <div
                      key={evidence.id}
                      className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs"
                    >
                      {getFileIcon(evidence.mimeType)}
                      <div className="flex-1 truncate">
                        <p className="truncate font-medium">{evidence.fileName}</p>
                        <p className="text-muted-foreground">{formatFileSize(evidence.fileSize)}</p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => {
                          setPreviewEvidence(evidence)
                          setShowPreview(true)
                        }}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-red-600"
                        onClick={() => handleDeleteEvidence(evidence.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  disabled={!currentExecution}
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.accept = 'image/*'
                      fileInputRef.current.click()
                    }
                  }}
                >
                  <Image className="w-3 h-3 mr-1" />
                  Captura
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  disabled={!currentExecution}
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.accept = '.txt,.log,.json'
                      fileInputRef.current.click()
                    }
                  }}
                >
                  <FileText className="w-3 h-3 mr-1" />
                  Log
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {previewEvidence && getFileIcon(previewEvidence.mimeType)}
              {previewEvidence?.fileName}
            </DialogTitle>
            <DialogDescription>
              {previewEvidence && formatFileSize(previewEvidence.fileSize)} - {previewEvidence?.type}
            </DialogDescription>
          </DialogHeader>
          {previewEvidence && (
            <div className="mt-4">
              {previewEvidence.mimeType.startsWith('image/') ? (
                <img
                  src={`/api${previewEvidence.filePath}`}
                  alt={previewEvidence.fileName}
                  className="max-w-full max-h-[60vh] mx-auto rounded"
                />
              ) : previewEvidence.mimeType === 'application/pdf' ? (
                <iframe
                  src={`/api${previewEvidence.filePath}`}
                  className="w-full h-[60vh] rounded"
                />
              ) : (
                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
                  <p className="text-center text-muted-foreground">
                    Vista previa no disponible para este tipo de archivo
                  </p>
                  <div className="text-center mt-4">
                    <Button asChild>
                      <a
                        href={`/api${previewEvidence.filePath}`}
                        download={previewEvidence.fileName}
                      >
                        Descargar Archivo
                      </a>
                    </Button>
                  </div>
                </div>
              )}
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                <p><strong>Hash SHA-256:</strong> {previewEvidence.hash}</p>
                <p><strong>Subido:</strong> {new Date(previewEvidence.uploadedAt).toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
