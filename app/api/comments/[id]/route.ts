import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

// DELETE /api/comments/:id — 비밀번호 확인 후 소프트 삭제
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { password } = await req.json()
  if (!password) return NextResponse.json({ error: '비밀번호가 필요합니다.' }, { status: 400 })

  const encoder = new TextEncoder()
  const data = encoder.encode(password + (process.env.COMMENT_SECRET ?? 'secret'))
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const password_hash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

  const supabase = getSupabase()

  // 비밀번호 일치 여부 확인
  const { data: comment } = await supabase
    .from('comments')
    .select('password_hash')
    .eq('id', params.id)
    .single()

  if (!comment) return NextResponse.json({ error: '댓글을 찾을 수 없습니다.' }, { status: 404 })
  if (comment.password_hash !== password_hash) {
    return NextResponse.json({ error: '비밀번호가 일치하지 않습니다.' }, { status: 403 })
  }

  const { error } = await supabase
    .from('comments')
    .update({ is_deleted: true })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
