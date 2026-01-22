import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { verifySignature } from '@/lib/signature'

// POST /api/signatures/[id]/verify - Verificar una firma
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    const result = await verifySignature(id)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error verifying signature:', error)
    return NextResponse.json(
      { error: 'Error al verificar la firma' },
      { status: 500 }
    )
  }
}
