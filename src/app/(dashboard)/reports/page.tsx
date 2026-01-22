'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FileText,
  Download,
  Calendar,
  Filter,
  Search,
  FileSpreadsheet,
  FileType2,
  Eye,
  Printer,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BarChart3,
  Loader2,
  Plus
} from 'lucide-react'

interface AuditSession {
  id: string
  name: string
  status: string
  progress: number
  passedCount: number
  failedCount: number
  blockedCount: number
  totalCount: number
}

interface Report {
  id: string
  type: string
  format: string
  fileName: string
  fileSize: number
  hash: string
  generatedAt: string
  session: {
    name: string
  }
}

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [reports, setReports] = useState<Report[]>([])
  const [sessions, setSessions] = useState<AuditSession[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  // Form state for new report
  const [selectedSession, setSelectedSession] = useState('')
  const [reportType, setReportType] = useState('DETAILED')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [reportsRes, sessionsRes] = await Promise.all([
        fetch('/api/reports'),
        fetch('/api/sessions'),
      ])

      if (reportsRes.ok) {
        const data = await reportsRes.json()
        setReports(data)
      }

      if (sessionsRes.ok) {
        const data = await sessionsRes.json()
        setSessions(data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function generateReport() {
    if (!selectedSession) return

    setGenerating(true)
    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedSession,
          type: reportType,
          format: 'HTML',
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setPreviewHtml(data.html)
        setPreviewOpen(true)
        setDialogOpen(false)
        fetchData() // Refresh reports list
      } else {
        const error = await res.json()
        alert(error.error || 'Error al generar el reporte')
      }
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Error al generar el reporte')
    } finally {
      setGenerating(false)
    }
  }

  function downloadReport(html: string, fileName: string) {
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function printReport() {
    if (!previewHtml) return
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(previewHtml)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || report.type === typeFilter
    return matchesSearch && matchesType
  })

  const reportTypes = [
    { value: 'all', label: 'Todos' },
    { value: 'EXECUTIVE_SUMMARY', label: 'Resumen Ejecutivo' },
    { value: 'DETAILED', label: 'Detallado' },
    { value: 'DEFECTS', label: 'Defectos' },
    { value: 'METRICS', label: 'Metricas' },
  ]

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      EXECUTIVE_SUMMARY: 'Resumen Ejecutivo',
      DETAILED: 'Detallado',
      DEFECTS: 'Defectos',
      METRICS: 'Metricas',
    }
    return labels[type] || type
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'PDF': return <FileType2 className="w-4 h-4 text-red-500" />
      case 'HTML': return <FileText className="w-4 h-4 text-blue-500" />
      default: return <FileSpreadsheet className="w-4 h-4 text-green-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reportes</h1>
          <p className="text-muted-foreground mt-1">
            Genera y descarga reportes de auditoria profesionales
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Generar Nuevo Reporte
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generar Reporte de Auditoria</DialogTitle>
              <DialogDescription>
                Seleccione la sesion de auditoria y el tipo de reporte a generar
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Sesion de Auditoria</label>
                <Select value={selectedSession} onValueChange={setSelectedSession}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una sesion" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map((session) => (
                      <SelectItem key={session.id} value={session.id}>
                        {session.name} ({session.progress}%)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Reporte</label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EXECUTIVE_SUMMARY">Resumen Ejecutivo</SelectItem>
                    <SelectItem value="DETAILED">Detallado Completo</SelectItem>
                    <SelectItem value="DEFECTS">Solo Defectos</SelectItem>
                    <SelectItem value="METRICS">Metricas y Estadisticas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full"
                onClick={generateReport}
                disabled={!selectedSession || generating}
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Generar Reporte
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reports.length}</p>
                <p className="text-sm text-muted-foreground">Total Reportes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-2xl font-bold">{sessions.length}</p>
                <p className="text-sm text-muted-foreground">Sesiones</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-teal-100 dark:bg-teal-900">
                <BarChart3 className="w-6 h-6 text-teal-600 dark:text-teal-300" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {reports.filter(r => r.type === 'DETAILED').length}
                </p>
                <p className="text-sm text-muted-foreground">Detallados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                <Download className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {reports.filter(r => r.type === 'METRICS').length}
                </p>
                <p className="text-sm text-muted-foreground">Metricas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar reportes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                {reportTypes.map((type) => (
                  <Button
                    key={type.value}
                    variant={typeFilter === type.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTypeFilter(type.value)}
                  >
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <Card key={report.id} className="hover:border-teal-200 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                    {getFormatIcon(report.format)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{report.fileName}</h3>
                      <Badge className="bg-teal-100 text-teal-700">
                        {getTypeLabel(report.type)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Sesion: {report.session?.name || 'N/A'}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(report.generatedAt).toLocaleString('es-CL')}
                      </span>
                      <span>{formatFileSize(report.fileSize)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      Hash: {report.hash.substring(0, 16)}...
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    Ver
                  </Button>
                  <Button variant="outline" size="sm">
                    <Printer className="w-4 h-4 mr-1" />
                    Imprimir
                  </Button>
                  <Button size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Descargar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No se encontraron reportes</h3>
            <p className="text-muted-foreground mb-4">
              {reports.length === 0
                ? 'Genere su primer reporte seleccionando una sesion de auditoria'
                : 'Ajuste los filtros de busqueda'}
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <FileText className="w-4 h-4 mr-2" />
              Generar Nuevo Reporte
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Vista Previa del Reporte</DialogTitle>
            <DialogDescription>
              Revise el reporte generado antes de descargarlo
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex gap-2">
            <Button onClick={printReport}>
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
            <Button
              variant="outline"
              onClick={() => previewHtml && downloadReport(previewHtml, `reporte-${Date.now()}.html`)}
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar HTML
            </Button>
          </div>
          {previewHtml && (
            <iframe
              srcDoc={previewHtml}
              className="w-full h-[60vh] border rounded-lg mt-4"
              title="Report Preview"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
