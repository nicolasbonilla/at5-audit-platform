import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { authConfig } from './auth.config'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      organizationId: string
      avatar?: string | null
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: string
    organizationId: string
    avatar?: string | null
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email y contrasena son requeridos')
        }

        const email = credentials.email as string
        const password = credentials.password as string

        // Buscar usuario por email
        const user = await prisma.user.findUnique({
          where: { email },
          include: { organization: true },
        })

        if (!user) {
          throw new Error('Credenciales invalidas')
        }

        // Verificar si la cuenta esta activa
        if (!user.isActive) {
          throw new Error('La cuenta esta desactivada')
        }

        // Verificar si la cuenta esta bloqueada
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          const minutesLeft = Math.ceil(
            (user.lockedUntil.getTime() - Date.now()) / 60000
          )
          throw new Error(
            `Cuenta bloqueada. Intente en ${minutesLeft} minutos`
          )
        }

        // Verificar contrasena
        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
          // Incrementar intentos fallidos
          const failedAttempts = user.failedAttempts + 1
          const updateData: { failedAttempts: number; lockedUntil?: Date } = { failedAttempts }

          // Bloquear despues de 5 intentos fallidos
          if (failedAttempts >= 5) {
            updateData.lockedUntil = new Date(Date.now() + 15 * 60 * 1000) // 15 minutos
            updateData.failedAttempts = 0
          }

          await prisma.user.update({
            where: { id: user.id },
            data: updateData,
          })

          throw new Error('Credenciales invalidas')
        }

        // Resetear intentos fallidos y actualizar ultimo login
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedAttempts: 0,
            lockedUntil: null,
            lastLogin: new Date(),
          },
        })

        // Crear log de auditoria para login exitoso
        await prisma.auditLog.create({
          data: {
            action: 'LOGIN',
            entity: 'User',
            entityId: user.id,
            userId: user.id,
            details: `Usuario ${user.email} inicio sesion exitosamente`,
          },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId,
          avatar: user.avatar,
        }
      },
    }),
  ],
})
