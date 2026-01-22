import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/test-plans - Obtener todos los planes de prueba
export async function GET() {
  try {
    const testPlans = await prisma.testPlan.findMany({
      include: {
        testSuites: {
          include: {
            testCases: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        organization: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Agregar conteo de casos por plan
    const plansWithCounts = testPlans.map(plan => ({
      ...plan,
      totalTestCases: plan.testSuites.reduce(
        (acc, suite) => acc + suite.testCases.length,
        0
      ),
      totalSuites: plan.testSuites.length,
    }))

    return NextResponse.json(plansWithCounts)
  } catch (error) {
    console.error('Error fetching test plans:', error)
    return NextResponse.json(
      { error: 'Error al obtener los planes de prueba' },
      { status: 500 }
    )
  }
}

// POST /api/test-plans - Crear nuevo plan de pruebas
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { title, version, description, scope, objectives, organizationId } = body

    const testPlan = await prisma.testPlan.create({
      data: {
        title,
        version,
        description,
        scope,
        objectives,
        organizationId,
      },
      include: {
        organization: true,
      },
    })

    return NextResponse.json(testPlan, { status: 201 })
  } catch (error) {
    console.error('Error creating test plan:', error)
    return NextResponse.json(
      { error: 'Error al crear el plan de pruebas' },
      { status: 500 }
    )
  }
}
