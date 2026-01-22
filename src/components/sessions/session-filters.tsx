'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Filter, X, Calendar, User } from 'lucide-react'
import { useDebouncedCallback } from 'use-debounce'

interface SessionFiltersProps {
  auditors?: { id: string; name: string }[]
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'DRAFT', label: 'Borrador' },
  { value: 'IN_PROGRESS', label: 'En Progreso' },
  { value: 'REVIEW', label: 'En Revisión' },
  { value: 'APPROVED', label: 'Aprobado' },
  { value: 'COMPLETED', label: 'Completado' },
  { value: 'CANCELLED', label: 'Cancelado' },
]

export function SessionFilters({ auditors = [] }: SessionFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const status = searchParams.get('status') || 'all'
  const auditorId = searchParams.get('auditorId') || 'all'

  // Crear nueva URL con parámetros actualizados
  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString())

      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === 'all' || value === '') {
          newSearchParams.delete(key)
        } else {
          newSearchParams.set(key, value)
        }
      })

      return newSearchParams.toString()
    },
    [searchParams]
  )

  // Actualizar URL con debounce para la búsqueda
  const debouncedSearch = useDebouncedCallback((value: string) => {
    const queryString = createQueryString({ search: value || null })
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}`)
  }, 300)

  // Manejar cambios de búsqueda
  const handleSearchChange = (value: string) => {
    setSearch(value)
    debouncedSearch(value)
  }

  // Manejar cambios de estado
  const handleStatusChange = (value: string) => {
    const queryString = createQueryString({ status: value })
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}`)
  }

  // Manejar cambios de auditor
  const handleAuditorChange = (value: string) => {
    const queryString = createQueryString({ auditorId: value })
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}`)
  }

  // Limpiar todos los filtros
  const clearFilters = () => {
    setSearch('')
    router.push(pathname)
  }

  // Contar filtros activos
  const activeFilters = [
    search,
    status !== 'all' ? status : null,
    auditorId !== 'all' ? auditorId : null,
  ].filter(Boolean).length

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          {/* Barra de búsqueda y filtros principales */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Búsqueda */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o descripción..."
                className="pl-9"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Selector de Estado */}
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Selector de Auditor */}
            {auditors.length > 0 && (
              <Select value={auditorId} onValueChange={handleAuditorChange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <User className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Auditor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los auditores</SelectItem>
                  {auditors.map((auditor) => (
                    <SelectItem key={auditor.id} value={auditor.id}>
                      {auditor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Filtros activos */}
          {activeFilters > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Filtros activos:</span>

              {search && (
                <Badge variant="secondary" className="gap-1">
                  Búsqueda: {search}
                  <button onClick={() => handleSearchChange('')}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}

              {status !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Estado: {STATUS_OPTIONS.find(o => o.value === status)?.label}
                  <button onClick={() => handleStatusChange('all')}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}

              {auditorId !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  Auditor: {auditors.find(a => a.id === auditorId)?.name}
                  <button onClick={() => handleAuditorChange('all')}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground"
              >
                Limpiar todo
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
