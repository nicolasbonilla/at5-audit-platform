import type { NextAuthConfig } from 'next-auth'

// Configuración base de NextAuth (sin Prisma, para usar en middleware)
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  trustHost: true,
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const pathname = nextUrl.pathname

      // Rutas públicas
      const publicPaths = ['/', '/login', '/api/auth', '/demo', '/docs', '/support']
      const isPublicPath = publicPaths.some(path => {
        if (path === '/') return pathname === '/'
        return pathname.startsWith(path)
      })

      // Recursos estáticos
      const isStaticPath =
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon') ||
        pathname.includes('.')

      if (isPublicPath || isStaticPath) {
        return true
      }

      if (!isLoggedIn) {
        return false // Redirige a signIn page
      }

      // Verificar roles para rutas protegidas
      const roleProtectedPaths: Record<string, string[]> = {
        '/admin': ['ADMIN'],
        '/settings': ['ADMIN', 'LEAD_AUDITOR'],
      }

      const userRole = auth?.user?.role as string
      for (const [path, allowedRoles] of Object.entries(roleProtectedPaths)) {
        if (pathname.startsWith(path)) {
          if (!allowedRoles.includes(userRole)) {
            return Response.redirect(new URL('/unauthorized', nextUrl))
          }
        }
      }

      return true
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = user.role as string
        token.organizationId = user.organizationId as string
      }
      return token
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.organizationId = token.organizationId as string
      }
      return session
    },
  },
  providers: [], // Se agregan en auth.ts
}
