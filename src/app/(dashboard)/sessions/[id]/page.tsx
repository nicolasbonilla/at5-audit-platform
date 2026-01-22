import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { SignaturePanel } from '@/components/sessions/signature-panel'
import { ExportButton } from '@/components/sessions/export-button'
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  FileText,
  Target,
  BarChart3
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

function getPriorityBadge(priority: string) {
  switch (priority) {
    case 'CRITICAL':
      return <Badge className="bg-red-100 text-red-700">Crítico</Badge>
    case 'HIGH':
      return <Badge className="bg-orange-100 text-orange-700">Alto</Badge>
    case 'MEDIUM':
      return <Badge className="bg-yellow-100 text-yellow-700">Medio</Badge>
    case 'LOW':
      return <Badge className="bg-gray-100 text-gray-700">Bajo</Badge>
    default:
      return <Badge>{priority}</Badge>
  }
}

function getExecutionStatusBadge(status: string | undefined) {
  if (!status) return <Badge className="bg-gray-100 text-gray-700">Pendiente</Badge>
  switch (status) {
    case 'PASSED':
      return <Badge className="bg-green-100 text-green-700">Aprobado</Badge>
    case 'FAILED':
      return <Badge className="bg-red-100 text-red-700">Fallido</Badge>
    case 'BLOCKED':
      return <Badge className="bg-yellow-100 text-yellow-700">Bloqueado</Badge>
    case 'SKIPPED':
      return <Badge className="bg-gray-100 text-gray-700">Omitido</Badge>
    default:
      return <Badge className="bg-gray-100 text-gray-700">Pendiente</Badge>
  }
}

async function getSession(id: string) {
  const session = await prisma.auditSession.findUnique({
    where: { id },
    include: {
      auditor: true,
      testPlan: {
        include: {
          testSuites: {
            include: {
              testCases: true,
            },
            orderBy: {
              order: 'asc',
            },
          },
        },
      },
      executions: {
        include: {
          testCase: true,
          executedBy: true,
        },
      },
    },
  })

  return session
}

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [session, authSession] = await Promise.all([
    getSession(id),
    auth(),
  ])

  if (!session) {
    notFound()
  }

  const currentUserRole = authSession?.user?.role || 'VIEWER'

  const pending = session.totalCount - session.passedCount - session.failedCount - session.blockedCount - session.skippedCount
  const successRate = session.totalCount > 0
    ? Math.round(((session.passedCount) / (session.passedCount + session.failedCount || 1)) * 100)
    : 0

  // Crear un mapa de ejecuciones por testCaseId
  const executionMap = new Map(
    session.executions.map(e => [e.testCaseId, e])
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/sessions">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">{session.name}</h1>
            {getStatusBadge(session.status)}
          </div>
          <p className="text-muted-foreground ml-12">
            {session.description || 'Sin descripción'}
          </p>
        </div>
        <div className="flex gap-2">
          <ExportButton sessionId={id} sessionName={session.name} />
          {(session.status === 'DRAFT' || session.status === 'IN_PROGRESS') && (
            <Button asChild>
              <Link href={`/sessions/${id}/execute`}>
                <Play className="w-4 h-4 mr-2" />
                {session.status === 'DRAFT' ? 'Iniciar' : 'Continuar'} Ejecución
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{session.passedCount}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Aprobados
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{session.failedCount}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <XCircle className="w-3 h-3" />
                Fallidos
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{session.blockedCount}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Bloqueados
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600">{pending}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Clock className="w-3 h-3" />
                Pendientes
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{session.totalCount}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Target className="w-3 h-3" />
                Total
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-600">{successRate}%</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <BarChart3 className="w-3 h-3" />
                Tasa de Éxito
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress and Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Progreso de Ejecución</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{session.progress}% completado</span>
                <span className="text-muted-foreground">
                  {session.passedCount + session.failedCount + session.blockedCount + session.skippedCount} de {session.totalCount} casos
                </span>
              </div>
              <Progress value={session.progress} className="h-4" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Auditor</div>
                <div className="font-medium">{session.auditor?.name || 'Sin asignar'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Fecha de Inicio</div>
                <div className="font-medium">{session.startDate?.toLocaleDateString('es-CL') || 'Sin fecha'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Plan de Pruebas</div>
                <div className="font-medium">{session.testPlan?.title || 'Sin plan'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Suites and Cases */}
      <Card>
        <CardHeader>
          <CardTitle>Casos de Prueba por Categoría</CardTitle>
          <CardDescription>
            {session.testPlan?.testSuites.length || 0} categorías con {session.totalCount} casos de prueba
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {session.testPlan?.testSuites.map((suite) => (
              <div key={suite.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{suite.name}</h3>
                  <Badge variant="outline">{suite.testCases.length} casos</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{suite.description}</p>
                <div className="border rounded-lg divide-y">
                  {suite.testCases.map((tc) => {
                    const execution = executionMap.get(tc.id)
                    return (
                      <div key={tc.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <code className="text-sm font-mono text-teal-600">{tc.code}</code>
                            <span className="font-medium">{tc.name}</span>
                            {getPriorityBadge(tc.priority)}
                          </div>
                          {getExecutionStatusBadge(execution?.status)}
                        </div>
                        {execution?.actualResult && (
                          <p className="text-sm text-muted-foreground mt-2 pl-4 border-l-2 border-gray-200">
                            {execution.actualResult}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Signatures Panel */}
      <SignaturePanel
        sessionId={id}
        sessionStatus={session.status}
        currentUserRole={currentUserRole}
      />
    </div>
  )
}
