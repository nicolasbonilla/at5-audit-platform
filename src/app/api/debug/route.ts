import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection
    const userCount = await prisma.user.count()

    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      userCount,
      env: {
        hasAuthSecret: !!process.env.AUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        nextAuthUrl: process.env.NEXTAUTH_URL || 'NOT SET',
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        authTrustHost: process.env.AUTH_TRUST_HOST || 'NOT SET',
        nodeEnv: process.env.NODE_ENV,
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      env: {
        hasAuthSecret: !!process.env.AUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
      }
    }, { status: 500 })
  }
}
