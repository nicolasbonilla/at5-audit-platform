'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Label } from '@/components/ui/label'
import { Bot, Loader2, Zap, Shield, Eye, FlaskConical } from 'lucide-react'

interface AIAuditorButtonProps {
  sessionId: string
  sessionName: string
  sessionStatus: string
  testCaseCount: number
}

const modes = [
  {
    value: 'SEMI_AUTOMATIC',
    label: 'Semi-Automatico',
    description: 'Requiere confirmacion para acciones criticas',
    icon: Shield,
    recommended: true,
  },
  {
    value: 'AUTOMATIC',
    label: 'Automatico',
    description: 'Sin intervencion humana (solo para pruebas de bajo riesgo)',
    icon: Zap,
    recommended: false,
  },
  {
    value: 'ASSISTED',
    label: 'Asistido',
    description: 'IA sugiere acciones, humano ejecuta manualmente',
    icon: Eye,
    recommended: false,
  },
  {
    value: 'DRY_RUN',
    label: 'Simulacion',
    description: 'Simula sin ejecutar (para validacion)',
    icon: FlaskConical,
    recommended: false,
  },
]

export function AIAuditorButton({
  sessionId,
  sessionName,
  sessionStatus,
  testCaseCount,
}: AIAuditorButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState('SEMI_AUTOMATIC')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Solo mostrar si la sesion esta en progreso o borrador
  const canStartAI = ['DRAFT', 'IN_PROGRESS'].includes(sessionStatus)

  if (!canStartAI) {
    return null
  }

  const handleStart = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/ai-auditor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          mode,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Error al iniciar AI Auditor')
      }

      setOpen(false)
      router.push('/ai-auditor')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const selectedMode = modes.find(m => m.value === mode)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-gradient-to-r from-teal-500 to-blue-500 text-white border-0 hover:from-teal-600 hover:to-blue-600">
          <Bot className="w-4 h-4 mr-2" />
          Iniciar AI Auditor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-teal-600" />
            Iniciar Auditoria con AI
          </DialogTitle>
          <DialogDescription>
            Ejecutar automaticamente los casos de prueba de &quot;{sessionName}&quot; usando inteligencia artificial.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Session Info */}
          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Casos de prueba:</span>
              <span className="font-medium">{testCaseCount}</span>
            </div>
          </div>

          {/* Mode Selection */}
          <div className="space-y-2">
            <Label>Modo de Ejecucion</Label>
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {modes.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    <div className="flex items-center gap-2">
                      <m.icon className="w-4 h-4" />
                      <span>{m.label}</span>
                      {m.recommended && (
                        <span className="text-xs text-teal-600 font-medium">(Recomendado)</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedMode && (
              <p className="text-xs text-muted-foreground">
                {selectedMode.description}
              </p>
            )}
          </div>

          {/* Warning for automatic mode */}
          {mode === 'AUTOMATIC' && (
            <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Advertencia:</strong> El modo automatico ejecutara todas las acciones sin confirmacion.
                Solo use este modo para pruebas de bajo riesgo.
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleStart} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Iniciando...
              </>
            ) : (
              <>
                <Bot className="w-4 h-4 mr-2" />
                Iniciar Auditoria AI
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
