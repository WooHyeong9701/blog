'use client'

import { useState, useRef, useEffect } from 'react'
import type { PostMeta } from '@/lib/posts'
import { PostCard } from './PostCard'

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
    </svg>
  )
}

function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

interface Props {
  posts: PostMeta[]
  totalCount: number
}

export function BlogSearchSection({ posts, totalCount }: Props) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = query.trim()
    ? posts.filter((post) => {
        const q = query.toLowerCase()
        return (
          post.frontmatter.title.toLowerCase().includes(q) ||
          post.frontmatter.description.toLowerCase().includes(q) ||
          post.frontmatter.category?.toLowerCase().includes(q) ||
          post.frontmatter.tags?.some((t) => t.toLowerCase().includes(q))
        )
      })
    : posts

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape') {
        setQuery('')
        inputRef.current?.blur()
      }
    }
    document.addEventListener('keydown', handleKeydown)
    return () => document.removeEventListener('keydown', handleKeydown)
  }, [])

  return (
    <>
      {/* 검색창 */}
      <div className="relative mb-8">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <SearchIcon />
        </span>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="글 검색... (⌘K)"
          className="w-full pl-10 pr-10 py-2.5 rounded-xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 transition-shadow text-sm"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <XIcon />
          </button>
        )}
      </div>

      {/* 결과 수 표시 */}
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        {query.trim()
          ? `"${query}" 검색 결과 ${filtered.length}개`
          : `총 ${totalCount}개의 글`}
      </p>

      {/* 포스트 목록 */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500 dark:text-slate-400">
          {query.trim() ? `"${query}"에 해당하는 글이 없어요.` : '아직 글이 없어요.'}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </>
  )
}
