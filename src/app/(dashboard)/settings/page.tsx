'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Settings,
  User,
  Building,
  Bell,
  Shield,
  Database,
  Palette,
  Globe,
  Save,
  Mail,
  Phone,
  MapPin,
  Clock,
  Key,
  Lock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react'

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    emailOnComplete: true,
    emailOnFailure: true,
    emailOnApproval: true,
    browserNotifications: true,
    dailyDigest: false,
    weeklyReport: true,
  })

  const [security, setSecurity] = useState({
    twoFactor: true,
    sessionTimeout: 60,
    ipRestriction: false,
    auditLogRetention: 365,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configuración</h1>
        <p className="text-muted-foreground mt-1">
          Administre la configuración del sistema y preferencias de usuario
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            <span className="hidden md:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="organization" className="gap-2">
            <Building className="w-4 h-4" />
            <span className="hidden md:inline">Organización</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden md:inline">Notificaciones</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden md:inline">Seguridad</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden md:inline">Sistema</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>
                Actualice su información de perfil y credenciales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center">
                  <User className="w-10 h-10 text-teal-600 dark:text-teal-300" />
                </div>
                <div>
                  <Button variant="outline" size="sm">Cambiar Foto</Button>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG. Máx 2MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre Completo</label>
                  <Input defaultValue="Dr. García" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Correo Electrónico</label>
                  <Input defaultValue="garcia@axongroup.com" type="email" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Teléfono</label>
                  <Input defaultValue="+56 9 1234 5678" type="tel" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rol</label>
                  <Input defaultValue="Lead Auditor" disabled />
                </div>
              </div>

              <div className="flex justify-end">
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cambiar Contraseña</CardTitle>
              <CardDescription>
                Actualice su contraseña de acceso al sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Contraseña Actual</label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nueva Contraseña</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirmar Contraseña</label>
                  <Input type="password" placeholder="••••••••" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="outline">
                  <Key className="w-4 h-4 mr-2" />
                  Actualizar Contraseña
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organization Tab */}
        <TabsContent value="organization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Organización</CardTitle>
              <CardDescription>
                Datos de la empresa para reportes y documentación oficial
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre de la Empresa</label>
                  <Input defaultValue="Axon Group Ltda" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">RUT/ID Fiscal</label>
                  <Input defaultValue="76.XXX.XXX-X" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Descripción</label>
                  <Input defaultValue="Empresa de software industrial especializada en protocolos SCADA" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Correo de Contacto
                  </label>
                  <Input defaultValue="contacto@axongroup.com" type="email" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Teléfono
                  </label>
                  <Input defaultValue="+56 2 2345 6789" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Dirección
                  </label>
                  <Input defaultValue="Av. Providencia 1234, Santiago, Chile" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Equipo de Auditoría</CardTitle>
              <CardDescription>
                Miembros del equipo con acceso al sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Dr. García', email: 'garcia@axongroup.com', role: 'Lead Auditor', status: 'active' },
                  { name: 'Ing. López', email: 'lopez@axongroup.com', role: 'Auditor', status: 'active' },
                  { name: 'Dr. Martínez', email: 'martinez@axongroup.com', role: 'Reviewer', status: 'active' },
                ].map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center">
                        <User className="w-5 h-5 text-teal-600 dark:text-teal-300" />
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{member.role}</Badge>
                      <Badge className="bg-green-100 text-green-700">Activo</Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="outline">
                  <User className="w-4 h-4 mr-2" />
                  Agregar Miembro
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de Notificación</CardTitle>
              <CardDescription>
                Configure cómo y cuándo desea recibir notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Notificaciones por Email</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Sesión Completada</p>
                      <p className="text-sm text-muted-foreground">Recibir email cuando una sesión de auditoría se complete</p>
                    </div>
                    <Checkbox
                      checked={notifications.emailOnComplete}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailOnComplete: checked as boolean }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Caso de Prueba Fallido</p>
                      <p className="text-sm text-muted-foreground">Notificar inmediatamente cuando un caso falle</p>
                    </div>
                    <Checkbox
                      checked={notifications.emailOnFailure}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailOnFailure: checked as boolean }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Aprobación Requerida</p>
                      <p className="text-sm text-muted-foreground">Notificar cuando una sesión requiera su aprobación</p>
                    </div>
                    <Checkbox
                      checked={notifications.emailOnApproval}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailOnApproval: checked as boolean }))}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Notificaciones del Navegador</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificaciones Push</p>
                    <p className="text-sm text-muted-foreground">Recibir notificaciones en tiempo real en el navegador</p>
                  </div>
                  <Checkbox
                    checked={notifications.browserNotifications}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, browserNotifications: checked as boolean }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Reportes Automáticos</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Resumen Diario</p>
                      <p className="text-sm text-muted-foreground">Recibir resumen de actividad cada día a las 18:00</p>
                    </div>
                    <Checkbox
                      checked={notifications.dailyDigest}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, dailyDigest: checked as boolean }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Reporte Semanal</p>
                      <p className="text-sm text-muted-foreground">Recibir métricas y estadísticas cada lunes</p>
                    </div>
                    <Checkbox
                      checked={notifications.weeklyReport}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, weeklyReport: checked as boolean }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Preferencias
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Seguridad</CardTitle>
              <CardDescription>
                Administre la seguridad de su cuenta y sesiones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-teal-100 dark:bg-teal-900">
                    <Shield className="w-6 h-6 text-teal-600 dark:text-teal-300" />
                  </div>
                  <div>
                    <p className="font-medium">Autenticación de Dos Factores (2FA)</p>
                    <p className="text-sm text-muted-foreground">Añade una capa extra de seguridad a tu cuenta</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {security.twoFactor ? (
                    <Badge className="bg-green-100 text-green-700">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Activado
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-700">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Desactivado
                    </Badge>
                  )}
                  <Button variant="outline" size="sm">
                    {security.twoFactor ? 'Configurar' : 'Activar'}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Tiempo de Expiración de Sesión (minutos)
                  </label>
                  <Input
                    type="number"
                    value={security.sessionTimeout}
                    onChange={(e) => setSecurity(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                    className="max-w-xs"
                  />
                  <p className="text-xs text-muted-foreground">La sesión se cerrará automáticamente después de este tiempo de inactividad</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Retención de Logs de Auditoría (días)
                  </label>
                  <Input
                    type="number"
                    value={security.auditLogRetention}
                    onChange={(e) => setSecurity(prev => ({ ...prev, auditLogRetention: parseInt(e.target.value) }))}
                    className="max-w-xs"
                  />
                  <p className="text-xs text-muted-foreground">Tiempo que se mantienen los registros de auditoría (mínimo 90 días por ISO 29119)</p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Configuración
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sesiones Activas</CardTitle>
              <CardDescription>
                Dispositivos donde su cuenta está actualmente conectada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-4">
                    <Globe className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-medium">Chrome - Windows</p>
                      <p className="text-sm text-muted-foreground">192.168.1.100 • Santiago, Chile</p>
                      <p className="text-xs text-green-600">Sesión actual</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-4">
                    <Globe className="w-6 h-6 text-gray-400" />
                    <div>
                      <p className="font-medium">Firefox - MacOS</p>
                      <p className="text-sm text-muted-foreground">192.168.1.105 • Santiago, Chile</p>
                      <p className="text-xs text-muted-foreground">Última actividad: hace 2 horas</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Cerrar Sesión</Button>
                </div>
              </div>
              <div className="mt-4">
                <Button variant="destructive" size="sm">
                  <Lock className="w-4 h-4 mr-2" />
                  Cerrar Todas las Sesiones
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Sistema</CardTitle>
              <CardDescription>
                Detalles técnicos y versión de la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <p className="text-sm text-muted-foreground">Versión de la Plataforma</p>
                  <p className="font-semibold">AT5 Audit Platform v1.0.0</p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <p className="text-sm text-muted-foreground">Última Actualización</p>
                  <p className="font-semibold">2026-01-12</p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <p className="text-sm text-muted-foreground">Base de Datos</p>
                  <p className="font-semibold">SQLite (Prisma ORM)</p>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <p className="text-sm text-muted-foreground">Framework</p>
                  <p className="font-semibold">Next.js 15 + React 19</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Apariencia</CardTitle>
              <CardDescription>
                Personalice la apariencia de la interfaz
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tema</label>
                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1">
                    <Palette className="w-4 h-4 mr-2" />
                    Claro
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Palette className="w-4 h-4 mr-2" />
                    Oscuro
                  </Button>
                  <Button variant="default" className="flex-1">
                    <Palette className="w-4 h-4 mr-2" />
                    Sistema
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Idioma</label>
                <div className="flex gap-4">
                  <Button variant="default" className="flex-1">
                    <Globe className="w-4 h-4 mr-2" />
                    Español
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Globe className="w-4 h-4 mr-2" />
                    English
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-teal-200 bg-teal-50 dark:bg-teal-900/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="w-8 h-8 text-teal-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-teal-800 dark:text-teal-300">
                    Cumplimiento de Estándares
                  </h3>
                  <p className="text-sm text-teal-700 dark:text-teal-400 mt-1">
                    Esta plataforma cumple con ISO/IEC/IEEE 29119 para documentación
                    de pruebas, IEEE 829 para formatos de reporte, e ISTQB para
                    metodología de testing. Todos los registros mantienen integridad
                    criptográfica para cumplimiento SOX.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
