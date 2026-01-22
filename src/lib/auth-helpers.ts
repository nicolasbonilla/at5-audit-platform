import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export type UserRole = 'ADMIN' | 'LEAD_AUDITOR' | 'AUDITOR' | 'REVIEWER' | 'VIEWER'

// Permisos por rol
export const rolePermissions: Record<UserRole, string[]> = {
  ADMIN: ['*'], // Acceso total
  LEAD_AUDITOR: [
    'sessions.create',
    'sessions.edit',
    'sessions.delete',
    'sessions.approve',
    'sessions.sign',
    'executions.create',
    'executions.edit',
    'reports.generate',
    'reports.export',
    'users.view',
    'settings.view',
  ],
  AUDITOR: [
    'sessions.view',
    'sessions.execute',
    'executions.create',
    'executions.edit',
    'evidences.upload',
    'reports.view',
  ],
  REVIEWER: [
    'sessions.view',
    'sessions.review',
    'sessions.comment',
    'reports.view',
    'reports.export',
  ],
  VIEWER: [
    'sessions.view',
    'reports.view',
  ],
}

// Verificar si un rol tiene un permiso especifico
export function hasPermission(role: UserRole, permission: string): boolean {
  const permissions = rolePermissions[role]
  if (!permissions) return false
  if (permissions.includes('*')) return true
  return permissions.includes(permission)
}

// Obtener sesion de usuario autenticado (server-side)
export async function getAuthUser() {
  const session = await auth()

  if (!session?.user) {
    return null
  }

  return session.user
}

// Requerir autenticacion (redirige si no esta autenticado)
export async function requireAuth() {
  const user = await getAuthUser()

  if (!user) {
    redirect('/login')
  }

  return user
}

// Requerir un rol especifico
export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireAuth()

  if (!allowedRoles.includes(user.role as UserRole)) {
    redirect('/unauthorized')
  }

  return user
}

// Requerir un permiso especifico
export async function requirePermission(permission: string) {
  const user = await requireAuth()

  if (!hasPermission(user.role as UserRole, permission)) {
    redirect('/unauthorized')
  }

  return user
}

// Obtener usuario completo con organizacion
export async function getFullUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      organization: true,
    },
  })
}
