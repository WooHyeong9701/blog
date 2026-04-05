import dynamic from 'next/dynamic'
import type { MDXComponents } from 'mdx/types'

// 차트 라이브러리(recharts, frappe-gantt)는 브라우저 전용 → ssr: false
const BarChart = dynamic(
  () => import('@/components/ui/BarChart').then((m) => ({ default: m.BarChart })),
  { ssr: false }
)

const LineChart = dynamic(
  () => import('@/components/ui/LineChart').then((m) => ({ default: m.LineChart })),
  { ssr: false }
)

const GanttChart = dynamic(
  () => import('@/components/ui/GanttChart').then((m) => ({ default: m.GanttChart })),
  { ssr: false }
)

export const mdxComponents: MDXComponents = {
  BarChart,
  LineChart,
  GanttChart,
}
