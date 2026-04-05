'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Props {
  slug: string
}

export function PostActions({ slug }: Props) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  async function handleDelete() {
    const password = sessionStorage.getItem('admin_pw')
    if (!password) {
      router.push(`/write/${slug}`)
      return
    }
    setDeleting(true)
    const res = await fetch(`/api/posts/${slug}`, {
      method: 'DELETE',
      headers: { 'x-admin-password': password },
    })
    setDeleting(false)
    if (res.ok) {
      router.push('/blog')
      router.refresh()
    } else {
      const data = await res.json()
      alert(data.error || '삭제 실패')
    }
  }

  return (
    <div className="flex items-center gap-2 mt-4">
      <Link
        href={`/write/${slug}`}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
        </svg>
        수정
      </Link>

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
          </svg>
          삭제
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600 dark:text-slate-400">정말 삭제할까요?</span>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-3 py-1.5 text-sm font-medium bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            {deleting ? '삭제 중…' : '삭제'}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          >
            취소
          </button>
        </div>
      )}
    </div>
  )
}
