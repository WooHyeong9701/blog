import { getAllPosts } from '@/lib/posts'
import { NextResponse } from 'next/server'

// 검색용 인덱스 데이터를 반환하는 API
export async function GET() {
  const posts = getAllPosts()

  const index = posts.map((post) => ({
    slug: post.slug,
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    tags: post.frontmatter.tags ?? [],
    category: post.frontmatter.category ?? '',
    date: post.frontmatter.date,
  }))

  return NextResponse.json(index, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
