'use client'

import { useState, useEffect } from 'react'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Area, AreaChart,
} from 'recharts'

interface Summary {
  today: number
  yesterday: number
  week: number
  month: number
  total: number
}

interface DailyData {
  date: string
  visitors: number
  cumulative: number
}

interface TopPost {
  slug: string
  title: string
  count: number
}

interface AnalyticsData {
  summary: Summary
  daily: DailyData[]
  weekly: DailyData[]
  topPosts: TopPost[]
}

type Range = '7d' | '30d'

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">{value.toLocaleString()}</p>
      {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sub}</p>}
    </div>
  )
}

export function AnalyticsCharts() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState<Range>('30d')

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-xl" />
      </div>
    )
  }

  if (!data) return <p className="text-slate-500">데이터를 불러오지 못했습니다.</p>

  const chartData = range === '30d' ? data.daily : data.weekly

  return (
    <div className="space-y-6">
      {/* 요약 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="오늘" value={data.summary.today} />
        <StatCard label="어제" value={data.summary.yesterday} />
        <StatCard label="이번 주" value={data.summary.week} />
        <StatCard label="이번 달" value={data.summary.month} />
        <StatCard label="누적" value={data.summary.total} sub="전체 기간" />
      </div>

      {/* 기간 선택 */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">방문자 추이</h2>
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
          {(['7d', '30d'] as Range[]).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-sm rounded-md font-medium transition-colors ${
                range === r
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {r === '7d' ? '7일' : '30일'}
            </button>
          ))}
        </div>
      </div>

      {/* 일별 방문자 + 누적 (영역 차트) */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-4">일별 방문자 / 누적</p>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f1f5f9' }}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="visitors"
              name="일별 방문자"
              stroke="#3b82f6"
              fill="url(#colorVisitors)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="cumulative"
              name="누적 방문자"
              stroke="#8b5cf6"
              fill="url(#colorCumulative)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 주간 막대 차트 */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-4">최근 7일 일간 방문자</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.weekly} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <Tooltip
              contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f1f5f9' }}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Bar dataKey="visitors" name="방문자" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 인기 포스트 */}
      {data.topPosts.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-4">인기 포스트 Top {data.topPosts.length}</p>
          <div className="space-y-3">
            {data.topPosts.map((post, i) => {
              const max = data.topPosts[0].count
              return (
                <div key={post.slug} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 w-5 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <a
                        href={`/blog/${post.slug}`}
                        className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {post.title}
                      </a>
                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-2 shrink-0">
                        {post.count.toLocaleString()}회
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${(post.count / max) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {data.topPosts.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
          <p className="text-slate-400 dark:text-slate-500 text-sm">아직 방문 데이터가 없습니다.</p>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">블로그 포스트를 방문하면 자동으로 기록됩니다.</p>
        </div>
      )}
    </div>
  )
}
