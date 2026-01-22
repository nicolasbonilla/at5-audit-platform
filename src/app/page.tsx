import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ClipboardCheck,
  Shield,
  FileText,
  Users,
  BarChart3,
  Lock,
  CheckCircle2,
  ArrowRight
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-teal-800 dark:text-teal-400">AT5 Audit Platform</h1>
              <p className="text-xs text-muted-foreground">Sistema de Auditoría Interactiva</p>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm font-medium hover:text-teal-600 transition-colors">
              Dashboard
            </Link>
            <Link href="/sessions" className="text-sm font-medium hover:text-teal-600 transition-colors">
              Sesiones
            </Link>
            <Button asChild>
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <CheckCircle2 className="w-4 h-4" />
            Cumple ISO/IEC 29119 e ISTQB
          </div>
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Auditoría Profesional para
            <span className="text-teal-600 block mt-2">AT5 MCP System</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Plataforma interactiva diseñada para equipos de QA de alto nivel.
            Ejecuta, documenta y certifica auditorías con estándares internacionales.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/sessions/new">
                Crear Nueva Auditoría
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/demo">Ver Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">Características Principales</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-2 hover:border-teal-200 transition-colors">
            <CardHeader>
              <ClipboardCheck className="w-10 h-10 text-teal-600 mb-2" />
              <CardTitle>Ejecución Interactiva</CardTitle>
              <CardDescription>
                Ejecuta casos de prueba paso a paso con checklist dinámico y captura de evidencias en tiempo real.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-teal-200 transition-colors">
            <CardHeader>
              <FileText className="w-10 h-10 text-teal-600 mb-2" />
              <CardTitle>Documentación ISO/IEC 29119</CardTitle>
              <CardDescription>
                Genera documentación completa siguiendo los estándares internacionales de testing de software.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-teal-200 transition-colors">
            <CardHeader>
              <Users className="w-10 h-10 text-teal-600 mb-2" />
              <CardTitle>Colaboración en Tiempo Real</CardTitle>
              <CardDescription>
                Múltiples auditores pueden trabajar simultáneamente con sincronización instantánea.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-teal-200 transition-colors">
            <CardHeader>
              <Lock className="w-10 h-10 text-teal-600 mb-2" />
              <CardTitle>Audit Trail Inmutable</CardTitle>
              <CardDescription>
                Registro completo de todas las acciones con hash criptográfico y soporte blockchain.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-teal-200 transition-colors">
            <CardHeader>
              <BarChart3 className="w-10 h-10 text-teal-600 mb-2" />
              <CardTitle>Dashboard Analítico</CardTitle>
              <CardDescription>
                Métricas en tiempo real, gráficos de progreso y KPIs de calidad del proceso.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-teal-200 transition-colors">
            <CardHeader>
              <Shield className="w-10 h-10 text-teal-600 mb-2" />
              <CardTitle>Firmas Digitales</CardTitle>
              <CardDescription>
                Sistema de aprobación multi-firma con certificados digitales PKI.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-teal-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">33+</div>
              <div className="text-teal-100">Herramientas MCP</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">7</div>
              <div className="text-teal-100">Agentes Especializados</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">8</div>
              <div className="text-teal-100">Proveedores LLM</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100%</div>
              <div className="text-teal-100">Trazabilidad</div>
            </div>
          </div>
        </div>
      </section>

      {/* Test Plan Preview */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-4">Plan de Pruebas AT5 MCP</h3>
          <p className="text-center text-muted-foreground mb-8">
            Basado en el documento profesional de auditoría
          </p>
          <Card>
            <CardHeader>
              <CardTitle>Categorías de Prueba</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { name: 'Proyectos', count: 6, icon: '📁' },
                  { name: 'Dispositivos', count: 7, icon: '🔧' },
                  { name: 'Señales', count: 5, icon: '📡' },
                  { name: 'Lotes', count: 2, icon: '📦' },
                  { name: 'Templates', count: 3, icon: '📋' },
                  { name: 'Tráfico', count: 3, icon: '🔄' },
                  { name: 'Reportes', count: 4, icon: '📊' },
                  { name: 'Escenarios', count: 3, icon: '🎬' },
                ].map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cat.icon}</span>
                      <span className="font-medium">{cat.name}</span>
                    </div>
                    <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded text-sm font-medium">
                      {cat.count} herramientas
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-teal-800 dark:text-teal-400">AT5 Audit</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Plataforma profesional de auditoría para sistemas industriales.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Estándares</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>ISO/IEC/IEEE 29119</li>
                <li>IEEE 829</li>
                <li>ISTQB</li>
                <li>OWASP</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Recursos</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/docs" className="hover:text-teal-600">Documentación</Link></li>
                <li><Link href="/api" className="hover:text-teal-600">API Reference</Link></li>
                <li><Link href="/support" className="hover:text-teal-600">Soporte</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contacto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Axon Group Ltda</li>
                <li>audit@axongroup.com</li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2026 Axon Group Ltda. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
