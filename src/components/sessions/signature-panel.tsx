'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  PenTool,
  CheckCircle2,
  XCircle,
  Shield,
  Loader2,
  AlertTriangle,
  User,
  Clock,
  Hash,
} from 'lucide-react'

interface Signature {
  id: string
  role: string
  signatureData?: string
  certificate?: string
  ipAddress?: string
  signedAt: string
  valid: boolean
  user: {
    id: string
    name: string
    email: string
    role: string
    avatar?: string
  }
}

interface Props {
  sessionId: string
  sessionStatus: string
  currentUserRole: string
}

export function SignaturePanel({ sessionId, sessionStatus, currentUserRole }: Props) {
  const [signatures, setSignatures] = useState<Signature[]>([])
  const [requirements, setRequirements] = useState<{
    complete: boolean
    missing: string[]
    signatures: Array<{ role: string; signedBy: string; signedAt: Date }>
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [signing, setSigning] = useState(false)
  const [showSignDialog, setShowSignDialog] = useState(false)
  const [verifying, setVerifying] = useState<string | null>(null)
  const [verificationResult, setVerificationResult] = useState<{
    id: string
    valid: boolean
    reason?: string
  } | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)

  const fetchSignatures = async () => {
    try {
      const res = await fetch(`/api/signatures?sessionId=${sessionId}`)
      if (res.ok) {
        const data = await res.json()
        setSignatures(data.signatures || [])
        setRequirements(data.requirements || null)
      }
    } catch (error) {
      console.error('Error fetching signatures:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSignatures()
  }, [sessionId])

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.strokeStyle = '#0d9488'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [showSignDialog])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    setIsDrawing(true)
    setHasSignature(true)

    const rect = canvas.getBoundingClientRect()
    let x, y

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    let x, y

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  const handleSign = async () => {
    const canvas = canvasRef.current
    if (!canvas || !hasSignature) return

    setSigning(true)
    try {
      const signatureImage = canvas.toDataURL('image/png')

      const res = await fetch('/api/signatures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          signatureImage,
        }),
      })

      if (res.ok) {
        await fetchSignatures()
        setShowSignDialog(false)
        clearCanvas()
      } else {
        const error = await res.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error signing:', error)
      alert('Error al firmar')
    } finally {
      setSigning(false)
    }
  }

  const handleVerify = async (signatureId: string) => {
    setVerifying(signatureId)
    try {
      const res = await fetch(`/api/signatures/${signatureId}/verify`, {
        method: 'POST',
      })

      if (res.ok) {
        const result = await res.json()
        setVerificationResult({
          id: signatureId,
          valid: result.valid,
          reason: result.reason,
        })

        // Clear after 5 seconds
        setTimeout(() => setVerificationResult(null), 5000)
      }
    } catch (error) {
      console.error('Error verifying:', error)
    } finally {
      setVerifying(null)
    }
  }

  const canSign = ['ADMIN', 'LEAD_AUDITOR', 'REVIEWER'].includes(currentUserRole) &&
                  ['IN_PROGRESS', 'REVIEW'].includes(sessionStatus)

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      ADMIN: 'Administrador',
      LEAD_AUDITOR: 'Auditor Lider',
      AUDITOR: 'Auditor',
      REVIEWER: 'Revisor',
      VIEWER: 'Observador',
    }
    return labels[role] || role
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <PenTool className="w-5 h-5" />
                Firmas Digitales
              </CardTitle>
              <CardDescription>
                Firmas de aprobacion de la sesion de auditoria
              </CardDescription>
            </div>
            {canSign && (
              <Button onClick={() => setShowSignDialog(true)}>
                <PenTool className="w-4 h-4 mr-2" />
                Firmar Sesion
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Requirements Status */}
          {requirements && (
            <div className={`p-4 rounded-lg mb-4 ${
              requirements.complete
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200'
                : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {requirements.complete ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-700">Todas las firmas requeridas</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <span className="font-semibold text-yellow-700">Firmas pendientes</span>
                  </>
                )}
              </div>
              {requirements.missing.length > 0 && (
                <p className="text-sm text-yellow-700">
                  Falta firma de: {requirements.missing.map(r => getRoleLabel(r)).join(', ')}
                </p>
              )}
            </div>
          )}

          {/* Signatures List */}
          {signatures.length > 0 ? (
            <div className="space-y-4">
              {signatures.map((sig) => (
                <div
                  key={sig.id}
                  className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  {sig.signatureData ? (
                    <img
                      src={sig.signatureData}
                      alt="Firma"
                      className="w-24 h-16 object-contain bg-white rounded border"
                    />
                  ) : (
                    <div className="w-24 h-16 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded">
                      <PenTool className="w-6 h-6 text-gray-400" />
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{sig.user.name}</span>
                      <Badge variant="outline">{getRoleLabel(sig.role)}</Badge>
                      {verificationResult?.id === sig.id && (
                        <Badge className={verificationResult.valid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                          {verificationResult.valid ? 'Verificada' : 'Invalida'}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {sig.user.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(sig.signedAt).toLocaleString()}
                      </span>
                    </div>
                    {sig.certificate && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1 font-mono">
                        <Hash className="w-3 h-3" />
                        {sig.certificate.substring(0, 24)}...
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVerify(sig.id)}
                    disabled={verifying === sig.id}
                  >
                    {verifying === sig.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-1" />
                        Verificar
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <PenTool className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay firmas registradas</p>
              <p className="text-sm">Las firmas son requeridas para aprobar la sesion</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sign Dialog */}
      <Dialog open={showSignDialog} onOpenChange={setShowSignDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Firmar Sesion de Auditoria</DialogTitle>
            <DialogDescription>
              Dibuje su firma en el area de abajo para aprobar esta sesion
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-2 bg-white">
              <canvas
                ref={canvasRef}
                width={360}
                height={150}
                className="w-full cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Firmando como: <strong>{getRoleLabel(currentUserRole)}</strong>
            </p>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={clearCanvas}>
                Limpiar
              </Button>
              <Button
                className="flex-1"
                onClick={handleSign}
                disabled={!hasSignature || signing}
              >
                {signing ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <PenTool className="w-4 h-4 mr-2" />
                )}
                Firmar
              </Button>
            </div>

            <div className="text-xs text-muted-foreground text-center p-2 bg-gray-50 rounded">
              <Shield className="w-4 h-4 inline mr-1" />
              Su firma sera protegida con certificado SHA-256 e incluira timestamp, IP y datos de la sesion
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
