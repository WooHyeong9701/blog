import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const POSTS_DIR = path.join(process.cwd(), 'content/posts')

function checkAuth(req: NextRequest) {
  const auth = req.headers.get('x-admin-password')
  return auth === process.env.ADMIN_PASSWORD
}

// PUT /api/posts/[slug] — 글 수정
export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  if (process.env.VERCEL) {
    return NextResponse.json({ error: '배포 환경에서는 로컬에서 수정 후 GitHub에 push해 주세요.' }, { status: 503 })
  }
  if (!checkAuth(req)) {
    return NextResponse.json({ error: '인증 실패' }, { status: 401 })
  }

  const { slug } = params
  const filePath = path.join(POSTS_DIR, `${slug}.mdx`)

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: '파일을 찾을 수 없습니다' }, { status: 404 })
  }

  const body = await req.json()
  const { title, description, date, category, tags, content, published } = body

  const tagsArray = Array.isArray(tags) ? tags : (tags || '').split(',').map((t: string) => t.trim()).filter(Boolean)

  const frontmatter = `---
title: '${title.replace(/'/g, "\\'")}'
description: '${(description || '').replace(/'/g, "\\'")}'
date: '${date}'
tags: [${tagsArray.map((t: string) => `'${t}'`).join(', ')}]
category: '${category || '일반'}'
published: ${published !== false}
---

`

  fs.writeFileSync(filePath, frontmatter + content, 'utf-8')
  return NextResponse.json({ slug })
}

// DELETE /api/posts/[slug] — 글 삭제
export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
  if (process.env.VERCEL) {
    return NextResponse.json({ error: '배포 환경에서는 로컬에서 삭제 후 GitHub에 push해 주세요.' }, { status: 503 })
  }
  if (!checkAuth(req)) {
    return NextResponse.json({ error: '인증 실패' }, { status: 401 })
  }

  const { slug } = params
  const filePath = path.join(POSTS_DIR, `${slug}.mdx`)

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: '파일을 찾을 수 없습니다' }, { status: 404 })
  }

  fs.unlinkSync(filePath)
  return NextResponse.json({ success: true })
}

// GET /api/posts/[slug] — 글 원문 조회 (에디터용)
export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params
  const filePath = path.join(POSTS_DIR, `${slug}.mdx`)

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: '파일을 찾을 수 없습니다' }, { status: 404 })
  }

  const raw = fs.readFileSync(filePath, 'utf-8')
  return NextResponse.json({ raw })
}
