'use client'

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts'

interface ExecutionStatusData {
  passed: number
  failed: number
  blocked: number
  skipped: number
  pending: number
}

interface SessionProgressData {
  name: string
  progress: number
  passed: number
  failed: number
}

interface TrendData {
  date: string
  passed: number
  failed: number
  total: number
}

const COLORS = {
  passed: '#22c55e',
  failed: '#ef4444',
  blocked: '#f97316',
  skipped: '#6b7280',
  pending: '#3b82f6',
}

export function ExecutionStatusPieChart({ data }: { data: ExecutionStatusData }) {
  const chartData = [
    { name: 'Aprobadas', value: data.passed, color: COLORS.passed },
    { name: 'Fallidas', value: data.failed, color: COLORS.failed },
    { name: 'Bloqueadas', value: data.blocked, color: COLORS.blocked },
    { name: 'Omitidas', value: data.skipped, color: COLORS.skipped },
    { name: 'Pendientes', value: data.pending, color: COLORS.pending },
  ].filter(item => item.value > 0)

  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-muted-foreground">
        No hay datos disponibles
      </div>
    )
  }

  return (
    <div className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [value, 'Casos']}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export function SessionProgressBarChart({ data }: { data: SessionProgressData[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-muted-foreground">
        No hay sesiones activas
      </div>
    )
  }

  return (
    <div className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
          <YAxis
            type="category"
            dataKey="name"
            width={150}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value: number) => [`${value}%`, 'Progreso']}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Bar
            dataKey="progress"
            fill="#0d9488"
            radius={[0, 4, 4, 0]}
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ExecutionTrendChart({ data }: { data: TrendData[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[250px] text-muted-foreground">
        No hay datos de tendencia disponibles
      </div>
    )
  }

  return (
    <div className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="passed"
            name="Aprobadas"
            stroke={COLORS.passed}
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="failed"
            name="Fallidas"
            stroke={COLORS.failed}
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="total"
            name="Total"
            stroke="#6b7280"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function SuccessRateGauge({ rate }: { rate: number }) {
  const data = [
    { name: 'success', value: rate },
    { name: 'remaining', value: 100 - rate },
  ]

  const getColor = (rate: number) => {
    if (rate >= 80) return '#22c55e'
    if (rate >= 60) return '#f97316'
    return '#ef4444'
  }

  return (
    <div className="h-[200px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={180}
            endAngle={0}
            innerRadius={70}
            outerRadius={90}
            paddingAngle={0}
            dataKey="value"
          >
            <Cell fill={getColor(rate)} />
            <Cell fill="#e5e7eb" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
        <span className="text-4xl font-bold" style={{ color: getColor(rate) }}>
          {rate}%
        </span>
        <span className="text-sm text-muted-foreground">Tasa de Éxito</span>
      </div>
    </div>
  )
}

export function PriorityDistributionChart({
  data,
}: {
  data: { priority: string; count: number }[]
}) {
  const priorityColors: Record<string, string> = {
    CRITICAL: '#dc2626',
    HIGH: '#ea580c',
    MEDIUM: '#eab308',
    LOW: '#6b7280',
  }

  const priorityLabels: Record<string, string> = {
    CRITICAL: 'Crítico',
    HIGH: 'Alto',
    MEDIUM: 'Medio',
    LOW: 'Bajo',
  }

  const chartData = data.map((item) => ({
    name: priorityLabels[item.priority] || item.priority,
    value: item.count,
    color: priorityColors[item.priority] || '#6b7280',
  }))

  if (chartData.length === 0 || chartData.every((d) => d.value === 0)) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
        No hay datos de prioridad
      </div>
    )
  }

  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value: number) => [value, 'Casos']}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
