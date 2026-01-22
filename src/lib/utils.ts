import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`
  }
  return `${secs}s`
}

export function calculateProgress(
  passed: number,
  failed: number,
  blocked: number,
  skipped: number,
  total: number
): number {
  if (total === 0) return 0
  const executed = passed + failed + blocked + skipped
  return Math.round((executed / total) * 100)
}

export function generateHash(data: string): string {
  // Simple hash for demo - in production use crypto.subtle.digest
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(16).padStart(16, '0')
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'CRITICAL':
      return 'priority-critical'
    case 'HIGH':
      return 'priority-high'
    case 'MEDIUM':
      return 'priority-medium'
    case 'LOW':
      return 'priority-low'
    default:
      return ''
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'PASSED':
      return 'status-passed'
    case 'FAILED':
      return 'status-failed'
    case 'BLOCKED':
      return 'status-blocked'
    case 'SKIPPED':
      return 'status-skipped'
    case 'IN_PROGRESS':
      return 'status-in-progress'
    default:
      return ''
  }
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    NOT_STARTED: 'No Iniciado',
    IN_PROGRESS: 'En Progreso',
    PASSED: 'Aprobado',
    FAILED: 'Fallido',
    BLOCKED: 'Bloqueado',
    SKIPPED: 'Omitido',
    DRAFT: 'Borrador',
    REVIEW: 'En Revisión',
    APPROVED: 'Aprobado',
    REJECTED: 'Rechazado',
    ARCHIVED: 'Archivado',
  }
  return labels[status] || status
}

export function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    CRITICAL: 'Crítica',
    HIGH: 'Alta',
    MEDIUM: 'Media',
    LOW: 'Baja',
  }
  return labels[priority] || priority
}
