import { AnalyticsCharts } from '@/components/admin/AnalyticsCharts'

export const metadata = { title: '방문자 통계' }

export default function AnalyticsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">방문자 통계</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">블로그 포스트 방문 기록 기반</p>
        </div>
      </div>
      <AnalyticsCharts />
    </div>
  )
}
