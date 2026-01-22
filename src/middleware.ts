import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

// Rutas públicas que no requieren autenticación
const publicPaths = ['/', '/login', '/api/auth', '/demo', '/docs', '/support']

// Rutas protegidas por rol
const roleProtectedPaths: Record<string, string[]> = {
  '/admin': ['ADMIN'],
  '/settings': ['ADMIN', 'LEAD_AUDITOR'],
}

export default auth((req) => {
  const { pathname } = req.nextUrl

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

  // Verificar autenticación
  if (!req.auth) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Verificar permisos de rol para rutas protegidas
  const userRole = req.auth.user?.role as string
  for (const [path, allowedRoles] of Object.entries(roleProtectedPaths)) {
    if (pathname.startsWith(path)) {
      if (!allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
}
