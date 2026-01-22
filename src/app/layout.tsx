import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/components/providers/session-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AT5 Audit Platform - Sistema de Auditoria Interactiva',
  description: 'Plataforma profesional de auditoria para el sistema AT5 MCP. Cumple con ISO/IEC 29119 e ISTQB.',
  keywords: ['auditoria', 'testing', 'QA', 'AT5', 'MCP', 'ISO 29119'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
