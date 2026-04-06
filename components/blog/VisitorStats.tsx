'use client'

import { useEffect, useState } from 'react'

export function VisitorStats() {
  const [today, setToday] = useState<number | null>(null)
  const [total, setTotal] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.json())
      .then(data => {
        setToday(data.summary?.today ?? 0)
        setTotal(data.summary?.total ?? 0)
      })
      .catch(() => {})
  }, [])

  if (today === null && total === null) return null

  return (
    <div className="flex items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
      <span>
        오늘{' '}
        <strong className="text-slate-900 dark:text-slate-100 font-semibold">
          {today?.toLocaleString()}
        </strong>
        명
      </span>
      <span className="w-px h-3 bg-slate-300 dark:bg-slate-600" />
      <span>
        누적{' '}
        <strong className="text-slate-900 dark:text-slate-100 font-semibold">
          {total?.toLocaleString()}
        </strong>
        명
      </span>
    </div>
  )
}
