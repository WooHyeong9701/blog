'use client'

import { useEffect, useRef, useState } from 'react'

export interface GanttTask {
  id: string
  name: string
  start: string
  end: string
  progress?: number
  dependencies?: string
}

type ViewMode = 'Day' | 'Week' | 'Month' | 'Quarter Day' | 'Half Day'

interface GanttChartProps {
  tasks: GanttTask[]
  title?: string
  viewMode?: ViewMode
  height?: number
}

export function GanttChart({ tasks, title, viewMode = 'Week', height = 300 }: GanttChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!mounted || !containerRef.current || !tasks || tasks.length === 0) return

    let cancelled = false

    async function init() {
      const Gantt = (await import('frappe-gantt')).default
      if (cancelled || !containerRef.current) return

      containerRef.current.innerHTML = '<svg id="gantt"></svg>'
      const svg = containerRef.current.querySelector('#gantt')!

      new Gantt(svg as SVGElement, tasks, {
        view_mode: viewMode,
        language: 'en',
        popup_trigger: 'click',
        custom_popup_html: (task: any) => `
          <div style="padding:8px;font-size:13px;min-width:160px">
            <strong>${task.name}</strong><br/>
            ${task.start} → ${task.end}<br/>
            진행률: ${task.progress ?? 0}%
          </div>
        `,
      })
    }

    init()

    const container = containerRef.current
    return () => {
      cancelled = true
      if (container) container.innerHTML = ''
    }
  }, [mounted, tasks, viewMode])

  if (!mounted) {
    return <div className="my-6 rounded-xl border bg-slate-50 dark:bg-slate-800 animate-pulse" style={{ height }} />
  }

  return (
    <div className="my-6 rounded-xl border bg-white dark:bg-slate-900 p-4 overflow-x-auto">
      {title && (
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">{title}</p>
      )}
      <div ref={containerRef} style={{ minHeight: height }} />
    </div>
  )
}
