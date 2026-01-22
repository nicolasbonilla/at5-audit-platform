import type { NextAuthConfig } from 'next-auth'

// Configuración base de NextAuth
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  trustHost: true,
  callbacks: {
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
