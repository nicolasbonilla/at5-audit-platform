import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Middleware simplificado - la protección real se hace en los layouts/páginas
// El middleware solo maneja redirecciones básicas

export function middleware(request: NextRequest) {
  // Permitir todas las rutas - la autenticación se verifica en cada página
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Excluir archivos estáticos y API de auth
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
}
