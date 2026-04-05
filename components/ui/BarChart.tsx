'use client'

import { useEffect, useState } from 'react'
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface BarChartProps {
  data: Record<string, string | number>[]
  xKey: string
  bars: { key: string; label?: string; color?: string }[]
  title?: string
  height?: number
  unit?: string
}

const DEFAULT_COLORS = ['#0ea5e9', '#6366f1', '#10b981', '#f59e0b', '#ef4444']

export function BarChart({ data, xKey, bars, title, height = 300, unit }: BarChartProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted || !bars || !data) {
    return <div className="my-6 rounded-xl border bg-slate-50 dark:bg-slate-800 animate-pulse" style={{ height }} />
  }

  return (
    <div className="my-6 rounded-xl border bg-white dark:bg-slate-900 p-4">
      {title && (
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 text-center">{title}</p>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <ReBarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} unit={unit} />
          <Tooltip
            contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #e2e8f0' }}
            formatter={(value, name) => [
              unit ? `${value}${unit}` : value,
              bars.find((b) => b.key === name)?.label ?? name,
            ]}
          />
          {bars.length > 1 && <Legend formatter={(value) => bars.find((b) => b.key === value)?.label ?? value} />}
          {bars.map((bar, i) => (
            <Bar
              key={bar.key}
              dataKey={bar.key}
              name={bar.key}
              fill={bar.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  )
}
