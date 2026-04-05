'use client'

import { useEffect, useState } from 'react'
import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface LineChartProps {
  data: Record<string, string | number>[]
  xKey: string
  lines: { key: string; label?: string; color?: string }[]
  title?: string
  height?: number
  unit?: string
}

const DEFAULT_COLORS = ['#0ea5e9', '#6366f1', '#10b981', '#f59e0b', '#ef4444']

export function LineChart({ data, xKey, lines, title, height = 300, unit }: LineChartProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted || !lines || !data) {
    return <div className="my-6 rounded-xl border bg-slate-50 dark:bg-slate-800 animate-pulse" style={{ height }} />
  }

  return (
    <div className="my-6 rounded-xl border bg-white dark:bg-slate-900 p-4">
      {title && (
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 text-center">{title}</p>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <ReLineChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} unit={unit} />
          <Tooltip
            contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #e2e8f0' }}
            formatter={(value, name) => [
              unit ? `${value}${unit}` : value,
              lines.find((l) => l.key === name)?.label ?? name,
            ]}
          />
          {lines.length > 1 && <Legend formatter={(value) => lines.find((l) => l.key === value)?.label ?? value} />}
          {lines.map((line, i) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.key}
              stroke={line.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </ReLineChart>
      </ResponsiveContainer>
    </div>
  )
}
