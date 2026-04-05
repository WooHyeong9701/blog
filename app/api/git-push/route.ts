import { NextRequest, NextResponse } from 'next/server'
import { execSync } from 'child_process'
import path from 'path'

// Vercel 환경에서는 동작 안 함 (로컬 전용)
export async function POST(req: NextRequest) {
  if (process.env.VERCEL) {
    return NextResponse.json({ ok: false, message: 'Vercel 환경에서는 사용 불가' })
  }

  const { slug, title } = await req.json()

  try {
    const cwd = process.cwd()
    const filePath = path.join('content/posts', `${slug}.mdx`)
    const commitMsg = `글 발행: ${title}`

    execSync(`git add "${filePath}"`, { cwd })
    execSync(`git commit -m "${commitMsg}"`, { cwd })
    execSync('git push', { cwd })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e.message }, { status: 500 })
  }
}
