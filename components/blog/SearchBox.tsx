'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Fuse from 'fuse.js'

interface SearchItem {
  slug: string
  title: string
  description: string
  tags: string[]
  category: string
  date: string
}

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
    </svg>
  )
}

export function SearchBox() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [index, setIndex] = useState<SearchItem[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 검색 인덱스 로드 (처음 포커스 시 1회)
  const loadIndex = useCallback(async () => {
    if (index.length > 0) return
    setLoading(true)
    try {
      const res = await fetch('/api/search')
      const data = await res.json()
      setIndex(data)
    } finally {
      setLoading(false)
    }
  }, [index.length])

  // Fuse.js 검색 실행
  useEffect(() => {
    if (!query.trim() || index.length === 0) {
      setResults([])
      return
    }

    const fuse = new Fuse(index, {
      keys: [
        { name: 'title', weight: 3 },
        { name: 'description', weight: 2 },
        { name: 'tags', weight: 1.5 },
        { name: 'category', weight: 1 },
      ],
      threshold: 0.35,
      includeScore: true,
    })

    const matches = fuse.search(query).slice(0, 6)
    setResults(matches.map((m) => m.item))
  }, [query, index])

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Cmd+K / Ctrl+K 단축키
  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        setIsOpen(true)
        loadIndex()
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('keydown', handleKeydown)
    return () => document.removeEventListener('keydown', handleKeydown)
  }, [loadIndex])

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })

  return (
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto">
      {/* 입력창 */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <SearchIcon />
        </span>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => {
            setIsOpen(true)
            loadIndex()
          }}
          placeholder="글 검색... (⌘K)"
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 transition-shadow text-sm"
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin text-xs">⟳</span>
        )}
      </div>

      {/* 결과 드롭다운 */}
      {isOpen && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border bg-white dark:bg-slate-800 shadow-xl overflow-hidden z-50">
          {results.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
              검색 결과가 없어요
            </div>
          ) : (
            <ul>
              {results.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/blog/${item.slug}`}
                    onClick={() => { setIsOpen(false); setQuery('') }}
                    className="flex flex-col gap-1 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
                        {item.title}
                      </span>
                      <span className="text-xs text-slate-400 shrink-0">{formatDate(item.date)}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.description}</p>
                    {item.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {item.tags.slice(0, 3).map((t) => (
                          <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
