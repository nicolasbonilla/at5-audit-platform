import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { SessionFilters } from '@/components/sessions/session-filters'
import {
  Plus,
  Calendar,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  MoreVertical,
  Play,
  Eye,
  FileText,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight
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
    case 'REJECTED':
      return <Badge className="bg-red-100 text-red-700">Rechazado</Badge>
    case 'CANCELLED':
      return <Badge className="bg-gray-100 text-gray-700">Cancelado</Badge>
    default:
      return <Badge>{status}</Badge>
  }
}

function getStatusActions(status: string, id: string) {
  switch (status) {
    case 'DRAFT':
      return (
        <Button size="sm" asChild>
          <Link href={`/sessions/${id}/execute`}>
            <Play className="w-4 h-4 mr-1" />
            Iniciar
          </Link>
        </Button>
      )
    case 'IN_PROGRESS':
      return (
        <Button size="sm" asChild>
          <Link href={`/sessions/${id}/execute`}>
            <Play className="w-4 h-4 mr-1" />
            Continuar
          </Link>
        </Button>
      )
    case 'REVIEW':
      return (
        <Button size="sm" variant="outline" asChild>
          <Link href={`/sessions/${id}`}>
            <Eye className="w-4 h-4 mr-1" />
            Revisar
          </Link>
        </Button>
      )
    case 'APPROVED':
    case 'COMPLETED':
      return (
        <Button size="sm" variant="outline" asChild>
          <Link href={`/sessions/${id}`}>
            <FileText className="w-4 h-4 mr-1" />
            Ver Detalles
          </Link>
        </Button>
      )
    default:
      return null
  }
}

interface SearchParams {
  search?: string
  status?: string
  auditorId?: string
  page?: string
}

async function getSessions(searchParams: SearchParams, userId: string, userRole: string) {
  const page = parseInt(searchParams.page || '1')
  const limit = 10

  // Construir filtros
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {}

  if (searchParams.search) {
    where.OR = [
      { name: { contains: searchParams.search } },
      { description: { contains: searchParams.search } },
    ]
  }

  if (searchParams.status && searchParams.status !== 'all') {
    where.status = searchParams.status
  }

  if (searchParams.auditorId && searchParams.auditorId !== 'all') {
    where.auditorId = searchParams.auditorId
  }

  // Si no es ADMIN, LEAD_AUDITOR o REVIEWER, solo ver sus propias sesiones
  if (!['ADMIN', 'LEAD_AUDITOR', 'REVIEWER'].includes(userRole)) {
    where.auditorId = userId
  }

  const [sessions, total] = await Promise.all([
    prisma.auditSession.findMany({
      where,
      include: {
        auditor: {
          select: { id: true, name: true, email: true },
        },
        testPlan: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditSession.count({ where }),
  ])

  return {
    sessions,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }
}

async function getAuditors() {
  return prisma.user.findMany({
    where: {
      role: { in: ['ADMIN', 'LEAD_AUDITOR', 'AUDITOR'] },
      isActive: true,
    },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
}

interface PageProps {
  searchParams: Promise<SearchParams>
}

export default async function SessionsPage({ searchParams }: PageProps) {
  const [authSession, auditors, params] = await Promise.all([
    auth(),
    getAuditors(),
    searchParams,
  ])

  const userId = authSession?.user?.id || ''
  const userRole = authSession?.user?.role || 'VIEWER'

  const { sessions, pagination } = await getSessions(params, userId, userRole)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sesiones de Auditoría</h1>
          <p className="text-muted-foreground">
            Gestiona y ejecuta tus auditorías de testing
          </p>
        </div>
        {['ADMIN', 'LEAD_AUDITOR'].includes(userRole) && (
          <Button asChild>
            <Link href="/sessions/new">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Sesión
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <SessionFilters auditors={auditors} />

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Mostrando {sessions.length} de {pagination.total} sesiones
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardCheck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">
              {params.search || params.status || params.auditorId
                ? 'No se encontraron sesiones'
                : 'No hay sesiones de auditoría'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {params.search || params.status || params.auditorId
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Crea tu primera sesión para comenzar a auditar'}
            </p>
            {!params.search && !params.status && !params.auditorId && ['ADMIN', 'LEAD_AUDITOR'].includes(userRole) && (
              <Button asChild>
                <Link href="/sessions/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primera Sesión
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const pending = session.totalCount - session.passedCount - session.failedCount - session.blockedCount - session.skippedCount

            return (
              <Card key={session.id} className="hover:border-teal-200 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-6">
                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Link
                          href={`/sessions/${session.id}`}
                          className="text-lg font-semibold hover:text-teal-600 transition-colors"
                        >
                          {session.name}
                        </Link>
                        {getStatusBadge(session.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {session.description || 'Sin descripción'}
                      </p>

                      {/* Progress */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progreso de ejecución</span>
                          <span className="font-medium">{session.progress}%</span>
                        </div>
                        <Progress value={session.progress} className="h-2" />
                      </div>

                      {/* Stats */}
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span className="font-medium">{session.passedCount}</span>
                          <span className="text-muted-foreground">aprobadas</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span className="font-medium">{session.failedCount}</span>
                          <span className="text-muted-foreground">fallidas</span>
                        </span>
                        {session.blockedCount > 0 && (
                          <span className="flex items-center gap-1 text-orange-600">
                            <span className="font-medium">{session.blockedCount}</span>
                            <span className="text-muted-foreground">bloqueadas</span>
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{pending}</span>
                          <span className="text-muted-foreground">pendientes</span>
                        </span>
                        <span className="text-muted-foreground">
                          de {session.totalCount} totales
                        </span>
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {session.auditor?.name || 'Sin asignar'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {session.startDate?.toLocaleDateString('es-CL') || 'Sin fecha'}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {session.testPlan?.title || 'Sin plan'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-2">
                      {getStatusActions(session.status, session.id)}
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            asChild={pagination.page > 1}
          >
            {pagination.page > 1 ? (
              <Link
                href={`/sessions?${new URLSearchParams({
                  ...(params.search ? { search: params.search } : {}),
                  ...(params.status ? { status: params.status } : {}),
                  ...(params.auditorId ? { auditorId: params.auditorId } : {}),
                  page: String(pagination.page - 1),
                }).toString()}`}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Link>
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </>
            )}
          </Button>

          <span className="text-sm text-muted-foreground px-4">
            Página {pagination.page} de {pagination.totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            asChild={pagination.page < pagination.totalPages}
          >
            {pagination.page < pagination.totalPages ? (
              <Link
                href={`/sessions?${new URLSearchParams({
                  ...(params.search ? { search: params.search } : {}),
                  ...(params.status ? { status: params.status } : {}),
                  ...(params.auditorId ? { auditorId: params.auditorId } : {}),
                  page: String(pagination.page + 1),
                }).toString()}`}
              >
                Siguiente
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            ) : (
              <>
                Siguiente
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
