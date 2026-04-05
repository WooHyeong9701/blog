import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Vercel 서버리스 환경에선 /tmp만 쓰기 가능
const DATA_FILE = process.env.VERCEL
  ? '/tmp/analytics.json'
  : path.join(process.cwd(), 'data/analytics.json')

interface PageView {
  date: string   // 'YYYY-MM-DD'
  slug: string
  title: string
}

interface AnalyticsData {
  pageViews: PageView[]
}

function readData(): AnalyticsData {
  try {
    if (!fs.existsSync(DATA_FILE)) return { pageViews: [] }
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
  } catch {
    return { pageViews: [] }
  }
}

function writeData(data: AnalyticsData) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true })
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

function toKST(date: Date) {
  return new Date(date.getTime() + 9 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]
}

// POST /api/analytics — 방문 기록
export async function POST(req: NextRequest) {
  try {
    const { slug, title } = await req.json()
    if (!slug) return NextResponse.json({ ok: false })

    const data = readData()
    data.pageViews.push({ date: toKST(new Date()), slug, title: title || slug })
    writeData(data)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false })
  }
}

// GET /api/analytics — 통계 조회
export async function GET() {
  const data = readData()
  const views = data.pageViews
  const today = toKST(new Date())

  const d = (offset: number) => {
    const dt = new Date()
    dt.setDate(dt.getDate() - offset)
    return toKST(dt)
  }

  // 날짜 범위별 집계
  const inRange = (date: string, start: string, end: string) =>
    date >= start && date <= end

  const todayCount = views.filter(v => v.date === today).length
  const yesterdayCount = views.filter(v => v.date === d(1)).length

  // 이번 주 (월~일)
  const now = new Date()
  const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1
  const weekStart = d(dayOfWeek)
  const weekCount = views.filter(v => inRange(v.date, weekStart, today)).length

  // 이번 달
  const monthStart = today.slice(0, 7) + '-01'
  const monthCount = views.filter(v => inRange(v.date, monthStart, today)).length

  const totalCount = views.length

  // 최근 30일 일별 방문자
  const last30: Record<string, number> = {}
  for (let i = 29; i >= 0; i--) {
    last30[d(i)] = 0
  }
  views.forEach(v => { if (v.date in last30) last30[v.date]++ })
  const daily = Object.entries(last30).map(([date, count]) => ({
    date: date.slice(5), // MM-DD
    visitors: count,
  }))

  // 누적 방문자 (최근 30일)
  let cumulative = 0
  const cumulativeData = daily.map(item => {
    cumulative += item.visitors
    return { ...item, cumulative }
  })

  // 인기 포스트 Top 10
  const slugMap: Record<string, { title: string; count: number }> = {}
  views.forEach(v => {
    if (!slugMap[v.slug]) slugMap[v.slug] = { title: v.title, count: 0 }
    slugMap[v.slug].count++
  })
  const topPosts = Object.entries(slugMap)
    .map(([slug, { title, count }]) => ({ slug, title, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // 최근 7일 일별 (막대 차트용)
  const last7: Record<string, number> = {}
  for (let i = 6; i >= 0; i--) last7[d(i)] = 0
  views.forEach(v => { if (v.date in last7) last7[v.date]++ })
  const weekly = Object.entries(last7).map(([date, count]) => ({
    date: date.slice(5),
    visitors: count,
  }))

  return NextResponse.json({
    summary: { today: todayCount, yesterday: yesterdayCount, week: weekCount, month: monthCount, total: totalCount },
    daily: cumulativeData,
    weekly,
    topPosts,
  })
}
