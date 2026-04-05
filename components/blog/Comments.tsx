'use client'

import { useState, useEffect, useCallback } from 'react'

interface Comment {
  id: number
  nickname: string
  content: string
  created_at: string
}

interface CommentsProps {
  slug: string
}

export function Comments({ slug }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ nickname: '', content: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState('')

  const fetchComments = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/comments?slug=${encodeURIComponent(slug)}`)
      const data = await res.json()
      setComments(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => { fetchComments() }, [fetchComments])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, ...form }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setForm({ nickname: '', content: '', password: '' })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      fetchComments()
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    setDeleteError('')
    const res = await fetch(`/api/comments/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: deletePassword }),
    })
    const data = await res.json()
    if (!res.ok) { setDeleteError(data.error); return }
    setDeleteTarget(null)
    setDeletePassword('')
    fetchComments()
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <section className="mt-16 pt-10 border-t">
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-6">
        댓글 {comments.length > 0 && <span className="text-brand-600 dark:text-brand-400">{comments.length}</span>}
      </h2>

      {/* 댓글 목록 */}
      {loading ? (
        <div className="text-sm text-slate-400 py-4">댓글을 불러오는 중...</div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 py-4">첫 번째 댓글을 남겨보세요!</p>
      ) : (
        <ul className="space-y-4 mb-8">
          {comments.map((c) => (
            <li key={c.id} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm text-slate-900 dark:text-slate-100">{c.nickname}</span>
                <div className="flex items-center gap-2">
                  <time className="text-xs text-slate-400">{formatDate(c.created_at)}</time>
                  <button
                    onClick={() => { setDeleteTarget(c.id); setDeleteError('') }}
                    className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{c.content}</p>

              {/* 삭제 비밀번호 입력 */}
              {deleteTarget === c.id && (
                <div className="mt-3 flex gap-2">
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="비밀번호"
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border bg-white dark:bg-slate-700 focus:outline-none focus:ring-1 focus:ring-red-400"
                    onKeyDown={(e) => e.key === 'Enter' && handleDelete(c.id)}
                  />
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="px-3 py-1.5 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    확인
                  </button>
                  <button
                    onClick={() => { setDeleteTarget(null); setDeletePassword(''); setDeleteError('') }}
                    className="px-3 py-1.5 text-xs border rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    취소
                  </button>
                  {deleteError && <p className="text-xs text-red-500 self-center">{deleteError}</p>}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* 댓글 작성 폼 */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-3">
          <input
            type="text"
            value={form.nickname}
            onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))}
            placeholder="닉네임"
            maxLength={20}
            required
            className="w-32 px-3 py-2 text-sm rounded-lg border bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            placeholder="비밀번호 (삭제 시 사용)"
            minLength={4}
            required
            className="flex-1 px-3 py-2 text-sm rounded-lg border bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <textarea
          value={form.content}
          onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
          placeholder="댓글을 남겨주세요..."
          rows={3}
          maxLength={1000}
          required
          className="w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-600 dark:text-green-400">댓글이 등록되었습니다!</p>}
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">{form.content.length} / 1000</span>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 text-sm font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? '등록 중...' : '댓글 등록'}
          </button>
        </div>
      </form>
    </section>
  )
}
