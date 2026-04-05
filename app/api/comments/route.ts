import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 댓글 조회/작성은 서버에서 처리 (service role key는 서버에서만 사용)
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

// GET /api/comments?slug=post-slug
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 })

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('comments')
    .select('id, nickname, content, created_at')
    .eq('post_slug', slug)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/comments
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { slug, nickname, content, password } = body

  if (!slug || !nickname?.trim() || !content?.trim() || !password) {
    return NextResponse.json({ error: '필수 항목을 입력해주세요.' }, { status: 400 })
  }
  if (nickname.length > 20) return NextResponse.json({ error: '닉네임은 20자 이내로 입력해주세요.' }, { status: 400 })
  if (content.length > 1000) return NextResponse.json({ error: '댓글은 1000자 이내로 입력해주세요.' }, { status: 400 })
  if (password.length < 4) return NextResponse.json({ error: '비밀번호는 4자 이상이어야 합니다.' }, { status: 400 })

  // 간단한 비밀번호 해시 (bcrypt 없이 crypto 사용)
  const encoder = new TextEncoder()
  const data = encoder.encode(password + (process.env.COMMENT_SECRET ?? 'secret'))
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const password_hash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

  const supabase = getSupabase()
  const { error } = await supabase.from('comments').insert({
    post_slug: slug,
    nickname: nickname.trim(),
    content: content.trim(),
    password_hash,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true }, { status: 201 })
}
