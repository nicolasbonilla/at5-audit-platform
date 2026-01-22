import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Rutas públicas que no requieren autenticación
const publicPaths = ['/', '/login', '/api/auth', '/demo', '/docs', '/support']

// Rutas protegidas por rol
const roleProtectedPaths: Record<string, string[]> = {
  '/admin': ['ADMIN'],
  '/settings': ['ADMIN', 'LEAD_AUDITOR'],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Permitir acceso a rutas públicas
  if (publicPaths.some(path => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  })) {
    return NextResponse.next()
  }

  // Permitir acceso a recursos estáticos
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Verificar autenticación usando JWT token
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET
  })

  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Verificar permisos de rol para rutas protegidas
  for (const [path, allowedRoles] of Object.entries(roleProtectedPaths)) {
    if (pathname.startsWith(path)) {
      if (!allowedRoles.includes(token.role as string)) {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
}
