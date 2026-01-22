'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  Settings,
  LogOut,
  Shield,
  User,
  ChevronRight,
  History,
  BarChart3,
  Users
} from 'lucide-react'

interface DashboardSidebarProps {
  user: {
    name: string
    email: string
    role: string
  }
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'LEAD_AUDITOR', 'AUDITOR', 'REVIEWER', 'VIEWER'] },
  { name: 'Sesiones de Auditoria', href: '/sessions', icon: ClipboardList, roles: ['ADMIN', 'LEAD_AUDITOR', 'AUDITOR', 'REVIEWER', 'VIEWER'] },
  { name: 'Reportes', href: '/reports', icon: FileText, roles: ['ADMIN', 'LEAD_AUDITOR', 'AUDITOR', 'REVIEWER', 'VIEWER'] },
  { name: 'Metricas', href: '/metrics', icon: BarChart3, roles: ['ADMIN', 'LEAD_AUDITOR', 'AUDITOR', 'REVIEWER'] },
  { name: 'Audit Log', href: '/audit-log', icon: History, roles: ['ADMIN', 'LEAD_AUDITOR'] },
  { name: 'Usuarios', href: '/users', icon: Users, roles: ['ADMIN'] },
  { name: 'Configuracion', href: '/settings', icon: Settings, roles: ['ADMIN', 'LEAD_AUDITOR'] },
]

const roleLabels: Record<string, string> = {
  ADMIN: 'Administrador',
  LEAD_AUDITOR: 'Lead Auditor',
  AUDITOR: 'Auditor',
  REVIEWER: 'Revisor',
  VIEWER: 'Observador',
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname()

  const filteredNavigation = navigation.filter(item =>
    item.roles.includes(user.role)
  )

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-white dark:bg-gray-800 transition-transform">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b px-6">
          <div className="w-9 h-9 bg-teal-600 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-teal-800 dark:text-teal-400">AT5 Audit</h1>
            <p className="text-xs text-muted-foreground">Platform v1.0</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
                {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="border-t p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
              <User className="w-5 h-5 text-teal-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {roleLabels[user.role] || user.role}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesion
          </Button>
        </div>
      </div>
    </aside>
  )
}
