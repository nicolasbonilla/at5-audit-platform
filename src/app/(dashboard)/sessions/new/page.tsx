'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Settings,
  ClipboardList,
  Loader2
} from 'lucide-react'

interface TestCase {
  id: string
  code: string
  name: string
  priority: string
}

interface TestSuite {
  id: string
  name: string
  description: string
  testCases: TestCase[]
}

interface TestPlan {
  id: string
  title: string
  version: string
  description: string
  totalTestCases: number
  totalSuites: number
  testSuites: TestSuite[]
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

const steps = [
  { id: 1, name: 'Información Básica', icon: FileText },
  { id: 2, name: 'Plan de Pruebas', icon: ClipboardList },
  { id: 3, name: 'Configuración', icon: Settings },
]

export default function NewSessionPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Data from API
  const [testPlans, setTestPlans] = useState<TestPlan[]>([])
  const [users, setUsers] = useState<User[]>([])

  // Form state
  const [sessionName, setSessionName] = useState('')
  const [sessionDescription, setSessionDescription] = useState('')
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const [selectedAuditorId, setSelectedAuditorId] = useState('')
  const [selectedTestCases, setSelectedTestCases] = useState<Set<string>>(new Set())

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        const [plansRes, usersRes] = await Promise.all([
          fetch('/api/test-plans'),
          fetch('/api/users'),
        ])

        if (plansRes.ok) {
          const plansData = await plansRes.json()
          setTestPlans(plansData)
          if (plansData.length > 0) {
            setSelectedPlanId(plansData[0].id)
            // Select all test cases by default
            const allCaseIds = plansData[0].testSuites.flatMap((s: TestSuite) =>
              s.testCases.map((tc: TestCase) => tc.id)
            )
            setSelectedTestCases(new Set(allCaseIds))
          }
        }

        if (usersRes.ok) {
          const usersData = await usersRes.json()
          setUsers(usersData)
          // Select first auditor by default
          const auditor = usersData.find((u: User) => u.role === 'LEAD_AUDITOR' || u.role === 'AUDITOR')
          if (auditor) {
            setSelectedAuditorId(auditor.id)
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Update selected test cases when plan changes
  useEffect(() => {
    const plan = testPlans.find(p => p.id === selectedPlanId)
    if (plan) {
      const allCaseIds = plan.testSuites.flatMap(s => s.testCases.map(tc => tc.id))
      setSelectedTestCases(new Set(allCaseIds))
    }
  }, [selectedPlanId, testPlans])

  const selectedPlan = testPlans.find(p => p.id === selectedPlanId)

  const toggleTestCase = (id: string) => {
    const newSelected = new Set(selectedTestCases)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedTestCases(newSelected)
  }

  const toggleSuite = (suite: TestSuite) => {
    const suiteIds = suite.testCases.map(tc => tc.id)
    const allSelected = suiteIds.every(id => selectedTestCases.has(id))

    const newSelected = new Set(selectedTestCases)
    if (allSelected) {
      suiteIds.forEach(id => newSelected.delete(id))
    } else {
      suiteIds.forEach(id => newSelected.add(id))
    }
    setSelectedTestCases(newSelected)
  }

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!sessionName || !selectedPlanId || !selectedAuditorId) return

    setSaving(true)
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: sessionName,
          description: sessionDescription,
          testPlanId: selectedPlanId,
          auditorId: selectedAuditorId,
          selectedTestCases: Array.from(selectedTestCases),
        }),
      })

      if (res.ok) {
        const session = await res.json()
        router.push(`/sessions/${session.id}`)
      }
    } catch (error) {
      console.error('Error creating session:', error)
    } finally {
      setSaving(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return sessionName.length > 0
      case 2:
        return selectedPlanId.length > 0
      case 3:
        return selectedAuditorId.length > 0 && selectedTestCases.size > 0
      default:
        return false
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/sessions">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Nueva Sesión de Auditoría</h1>
          <p className="text-muted-foreground">
            Configure una nueva sesión de pruebas
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center gap-3 ${index > 0 ? 'flex-1' : ''}`}>
              {index > 0 && (
                <div className={`h-0.5 w-full ${currentStep > index ? 'bg-teal-600' : 'bg-gray-200'}`} />
              )}
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  currentStep > step.id
                    ? 'bg-teal-600 border-teal-600 text-white'
                    : currentStep === step.id
                    ? 'border-teal-600 text-teal-600'
                    : 'border-gray-300 text-gray-300'
                }`}
              >
                {currentStep > step.id ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
            </div>
            <span
              className={`ml-3 text-sm font-medium ${
                currentStep >= step.id ? 'text-teal-600' : 'text-gray-400'
              }`}
            >
              {step.name}
            </span>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <CardTitle className="mb-4">Información Básica</CardTitle>
                <CardDescription>
                  Proporcione los detalles básicos de la sesión de auditoría
                </CardDescription>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Nombre de la Sesión <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Ej: Auditoría AT5 MCP - Sprint 24"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Descripción</label>
                  <Textarea
                    placeholder="Descripción detallada de la sesión de auditoría..."
                    value={sessionDescription}
                    onChange={(e) => setSessionDescription(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <CardTitle className="mb-4">Seleccionar Plan de Pruebas</CardTitle>
                <CardDescription>
                  Elija el plan de pruebas que desea utilizar para esta auditoría
                </CardDescription>
              </div>

              <div className="space-y-4">
                {testPlans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedPlanId === plan.id
                        ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{plan.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {plan.description}
                        </p>
                      </div>
                      <Badge variant="outline">v{plan.version}</Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span>{plan.totalSuites} categorías</span>
                      <span>{plan.totalTestCases} casos de prueba</span>
                    </div>
                  </div>
                ))}

                {testPlans.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay planes de prueba disponibles
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <CardTitle className="mb-4">Configuración</CardTitle>
                <CardDescription>
                  Seleccione el auditor y los casos de prueba a incluir
                </CardDescription>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Auditor Responsable <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {users.filter(u => u.role === 'LEAD_AUDITOR' || u.role === 'AUDITOR').map((user) => (
                      <div
                        key={user.id}
                        onClick={() => setSelectedAuditorId(user.id)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                          selectedAuditorId === user.id
                            ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.role.replace('_', ' ')}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      Casos de Prueba ({selectedTestCases.size} seleccionados)
                    </label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (selectedPlan) {
                          const allIds = selectedPlan.testSuites.flatMap(s => s.testCases.map(tc => tc.id))
                          if (selectedTestCases.size === allIds.length) {
                            setSelectedTestCases(new Set())
                          } else {
                            setSelectedTestCases(new Set(allIds))
                          }
                        }
                      }}
                    >
                      {selectedPlan && selectedTestCases.size === selectedPlan.testSuites.flatMap(s => s.testCases).length
                        ? 'Deseleccionar Todos'
                        : 'Seleccionar Todos'}
                    </Button>
                  </div>

                  <div className="border rounded-lg max-h-[300px] overflow-y-auto">
                    {selectedPlan?.testSuites.map((suite) => {
                      const suiteIds = suite.testCases.map(tc => tc.id)
                      const allSelected = suiteIds.every(id => selectedTestCases.has(id))
                      const someSelected = suiteIds.some(id => selectedTestCases.has(id))

                      return (
                        <div key={suite.id}>
                          <div
                            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => toggleSuite(suite)}
                          >
                            <Checkbox
                              checked={allSelected}
                              className={someSelected && !allSelected ? 'opacity-50' : ''}
                            />
                            <span className="font-medium">{suite.name}</span>
                            <Badge variant="outline" className="ml-auto">
                              {suiteIds.filter(id => selectedTestCases.has(id)).length}/{suite.testCases.length}
                            </Badge>
                          </div>
                          {suite.testCases.map((tc) => (
                            <div
                              key={tc.id}
                              className="flex items-center gap-3 p-3 pl-8 border-t cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                              onClick={() => toggleTestCase(tc.id)}
                            >
                              <Checkbox checked={selectedTestCases.has(tc.id)} />
                              <code className="text-xs text-teal-600">{tc.code}</code>
                              <span className="text-sm">{tc.name}</span>
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>

        {currentStep < 3 ? (
          <Button onClick={handleNext} disabled={!canProceed()}>
            Siguiente
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={!canProceed() || saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Crear Sesión
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
