'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface PostEditorProps {
  slug?: string
  initialRaw?: string
}

interface DraftData {
  title: string
  slug: string
  slugManual: boolean
  description: string
  date: string
  category: string
  tags: string
  content: string
  published: boolean
  savedAt: number
}

function titleToSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function parseRaw(raw: string) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return { frontmatter: {}, content: raw }

  const fm: Record<string, string> = {}
  match[1].split('\n').forEach((line) => {
    const i = line.indexOf(':')
    if (i === -1) return
    const key = line.slice(0, i).trim()
    const val = line.slice(i + 1).trim().replace(/^['"]|['"]$/g, '')
    fm[key] = val
  })

  const tagsMatch = match[1].match(/tags:\s*\[(.*?)\]/)
  if (tagsMatch) {
    fm.tags = tagsMatch[1].replace(/['"]/g, '').split(',').map(t => t.trim()).join(', ')
  }

  return { frontmatter: fm, content: match[2].trim() }
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

export function PostEditor({ slug: editSlug, initialRaw }: PostEditorProps) {
  const router = useRouter()
  const draftKey = editSlug ? `blog_draft_${editSlug}` : 'blog_draft_new'

  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState('')

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManual, setSlugManual] = useState(false)
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [content, setContent] = useState('')
  const [published, setPublished] = useState(true)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'write' | 'preview'>('write')
  const [preview, setPreview] = useState('')

  // 임시저장 상태
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null)
  const [showDraftBanner, setShowDraftBanner] = useState(false)
  const [pendingDraft, setPendingDraft] = useState<DraftData | null>(null)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstLoad = useRef(true)

  // 인증 상태 복원
  useEffect(() => {
    const saved = sessionStorage.getItem('admin_pw')
    if (saved) { setPassword(saved); setAuthed(true) }
  }, [])

  // 수정 모드: 초기값 채우기
  useEffect(() => {
    if (initialRaw) {
      const { frontmatter: fm, content: c } = parseRaw(initialRaw)
      setTitle(fm.title || '')
      setSlug(editSlug || '')
      setSlugManual(true)
      setDescription(fm.description || '')
      setDate(fm.date || new Date().toISOString().split('T')[0])
      setCategory(fm.category || '')
      setTags(fm.tags || '')
      setContent(c)
      setPublished(fm.published !== 'false')
    }
  }, [initialRaw, editSlug])

  // 페이지 로드 시 임시저장 확인
  useEffect(() => {
    if (!authed) return
    try {
      const raw = localStorage.getItem(draftKey)
      if (!raw) return
      const draft: DraftData = JSON.parse(raw)
      // 내용이 있을 때만 배너 표시
      if (draft.title || draft.content) {
        setPendingDraft(draft)
        setShowDraftBanner(true)
      }
    } catch {}
  }, [authed, draftKey])

  // 제목 → slug 자동 생성
  useEffect(() => {
    if (!slugManual && !editSlug) {
      setSlug(titleToSlug(title))
    }
  }, [title, slugManual, editSlug])

  // 자동 임시저장 (변경 1초 후)
  const scheduleSave = useCallback(() => {
    if (isFirstLoad.current) { isFirstLoad.current = false; return }
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => {
      const draft: DraftData = {
        title, slug, slugManual, description, date, category, tags, content, published,
        savedAt: Date.now(),
      }
      try {
        localStorage.setItem(draftKey, JSON.stringify(draft))
        setDraftSavedAt(draft.savedAt)
      } catch {}
    }, 1000)
  }, [title, slug, slugManual, description, date, category, tags, content, published, draftKey])

  useEffect(() => { scheduleSave() }, [scheduleSave])

  function loadDraft(draft: DraftData) {
    setTitle(draft.title)
    setSlug(draft.slug)
    setSlugManual(draft.slugManual)
    setDescription(draft.description)
    setDate(draft.date)
    setCategory(draft.category)
    setTags(draft.tags)
    setContent(draft.content)
    setPublished(draft.published)
    setDraftSavedAt(draft.savedAt)
    setShowDraftBanner(false)
    setPendingDraft(null)
    isFirstLoad.current = true // 불러온 직후 자동저장 트리거 방지
  }

  function discardDraft() {
    localStorage.removeItem(draftKey)
    setShowDraftBanner(false)
    setPendingDraft(null)
  }

  function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    if (!password.trim()) { setAuthError('비밀번호를 입력하세요'); return }
    sessionStorage.setItem('admin_pw', password)
    setAuthed(true)
    setAuthError('')
  }

  async function handleSave() {
    if (!title.trim()) { setError('제목을 입력하세요'); return }
    if (!content.trim()) { setError('내용을 입력하세요'); return }
    setSaving(true)
    setError('')

    const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean)
    const body = { title, description, date, category, tags: tagsArray, content, published, slug }
    const url = editSlug ? `/api/posts/${editSlug}` : '/api/posts'
    const method = editSlug ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      if (res.status === 401) {
        setAuthed(false)
        sessionStorage.removeItem('admin_pw')
        setAuthError('비밀번호가 올바르지 않습니다')
      } else {
        setError(data.error || '저장 실패')
      }
      return
    }

    // 발행 성공 시 임시저장 삭제
    localStorage.removeItem(draftKey)

    // 로컬 환경에서 자동 git push
    const finalSlug = data.slug || editSlug
    try {
      await fetch('/api/git-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: finalSlug, title }),
      })
    } catch {}

    router.push(`/blog/${finalSlug}`)
    router.refresh()
  }

  // ── 비밀번호 화면 ──────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <form onSubmit={handleAuth} className="w-full max-w-sm space-y-4">
          <h2 className="text-xl font-bold text-center text-slate-800 dark:text-slate-100">관리자 인증</h2>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="비밀번호"
            autoFocus
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {authError && <p className="text-red-500 text-sm">{authError}</p>}
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            확인
          </button>
        </form>
      </div>
    )
  }

  // ── 에디터 화면 ──────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-4">
      {/* 임시저장 불러오기 배너 */}
      {showDraftBanner && pendingDraft && (
        <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg text-sm">
          <span className="text-amber-800 dark:text-amber-300">
            임시저장된 글이 있습니다 ({formatTime(pendingDraft.savedAt)}). 불러올까요?
          </span>
          <div className="flex gap-2 ml-4 shrink-0">
            <button
              onClick={() => loadDraft(pendingDraft)}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-md font-medium transition-colors"
            >
              불러오기
            </button>
            <button
              onClick={discardDraft}
              className="px-3 py-1 text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 transition-colors"
            >
              무시
            </button>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          {editSlug ? '글 수정' : '새 글 쓰기'}
        </h1>
        <div className="flex items-center gap-3">
          {/* 임시저장 상태 표시 */}
          {draftSavedAt && (
            <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
              </svg>
              임시저장됨 {formatTime(draftSavedAt)}
            </span>
          )}
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={published}
              onChange={e => setPublished(e.target.checked)}
              className="rounded"
            />
            발행
          </label>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
          >
            {saving ? '저장 중…' : editSlug ? '수정 저장' : '발행하기'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* 메타 정보 */}
      <div className="grid grid-cols-1 gap-4">
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="제목"
          className="w-full px-4 py-3 text-xl font-bold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="한 줄 설명 (SEO용)"
          className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="col-span-2">
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">슬러그 (URL)</label>
            <input
              type="text"
              value={slug}
              onChange={e => { setSlug(e.target.value); setSlugManual(true) }}
              placeholder="url-slug"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">날짜</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">카테고리</label>
            <input
              type="text"
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="개발"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">태그 (쉼표로 구분)</label>
          <input
            type="text"
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="Next.js, React, TypeScript"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>

      {/* 편집 / 미리보기 탭 */}
      <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <button
            onClick={() => setTab('write')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${tab === 'write' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            편집
          </button>
          <button
            onClick={() => { setTab('preview'); setPreview(content) }}
            className={`px-4 py-2 text-sm font-medium transition-colors ${tab === 'preview' ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            미리보기
          </button>
          <div className="ml-auto px-4 py-2 text-xs text-slate-400 dark:text-slate-500 self-center">
            MDX 지원
          </div>
        </div>

        {tab === 'write' ? (
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={`## 제목\n\n본문을 MDX로 작성하세요.\n\n코드 블록, 이미지, 차트 컴포넌트 모두 사용 가능합니다.`}
            className="w-full h-[500px] p-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-sm resize-y focus:outline-none"
          />
        ) : (
          <div className="min-h-[500px] p-6 bg-white dark:bg-slate-900">
            <p className="text-slate-500 dark:text-slate-400 text-sm">미리보기는 저장 후 실제 페이지에서 확인하세요.</p>
          </div>
        )}
      </div>

      <div className="text-xs text-slate-400 dark:text-slate-500 space-y-1">
        <p>• Markdown + JSX(MDX) 문법을 지원합니다</p>
        <p>• 차트: <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">&lt;BarChart /&gt;</code> <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">&lt;LineChart /&gt;</code> <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">&lt;GanttChart /&gt;</code></p>
        <p>• 저장하면 <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">content/posts/{slug || 'slug'}.mdx</code> 파일이 생성됩니다</p>
      </div>
    </div>
  )
}
