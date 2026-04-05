import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const POSTS_DIR = path.join(process.cwd(), 'content/posts')

function checkAuth(req: NextRequest) {
  const auth = req.headers.get('x-admin-password')
  return auth === process.env.ADMIN_PASSWORD
}

function titleToSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// POST /api/posts — 새 글 생성
export async function POST(req: NextRequest) {
  if (process.env.VERCEL) {
    return NextResponse.json(
      { error: '배포 환경에서는 로컬에서 글을 작성 후 GitHub에 push해 주세요.' },
      { status: 503 }
    )
  }
  if (!checkAuth(req)) {
    return NextResponse.json({ error: '인증 실패' }, { status: 401 })
  }

  const body = await req.json()
  const { title, description, date, category, tags, content, published, slug: customSlug } = body

  if (!title || !content) {
    return NextResponse.json({ error: '제목과 내용은 필수입니다' }, { status: 400 })
  }

  const slug = customSlug || titleToSlug(title)
  const filePath = path.join(POSTS_DIR, `${slug}.mdx`)

  if (fs.existsSync(filePath) && !customSlug) {
    return NextResponse.json({ error: '같은 슬러그의 파일이 이미 존재합니다', slug }, { status: 409 })
  }

  const tagsArray = Array.isArray(tags) ? tags : (tags || '').split(',').map((t: string) => t.trim()).filter(Boolean)
  const postDate = date || new Date().toISOString().split('T')[0]

  const frontmatter = `---
title: '${title.replace(/'/g, "\\'")}'
description: '${(description || '').replace(/'/g, "\\'")}'
date: '${postDate}'
tags: [${tagsArray.map((t: string) => `'${t}'`).join(', ')}]
category: '${category || '일반'}'
published: ${published !== false}
---

`

  if (!fs.existsSync(POSTS_DIR)) fs.mkdirSync(POSTS_DIR, { recursive: true })
  fs.writeFileSync(filePath, frontmatter + content, 'utf-8')

  return NextResponse.json({ slug }, { status: 201 })
}
