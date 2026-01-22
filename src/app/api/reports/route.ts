import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/reports - Obtener lista de reportes
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const type = searchParams.get('type')

    const where: Record<string, unknown> = {}

    if (sessionId) where.sessionId = sessionId
    if (type) where.type = type

    const reports = await prisma.report.findMany({
      where,
      include: {
        session: {
          select: {
            name: true,
            status: true,
          },
        },
      },
      orderBy: {
        generatedAt: 'desc',
      },
    })

    return NextResponse.json(reports)
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { error: 'Error al obtener los reportes' },
      { status: 500 }
    )
  }
}
