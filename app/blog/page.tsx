import type { Metadata } from 'next'
import { getAllPosts, getAllCategories, getAllTags } from '@/lib/posts'
import { BlogSearchSection } from '@/components/blog/BlogSearchSection'
import { siteConfig } from '@/lib/config'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '블로그',
  description: '모든 글 목록입니다.',
  alternates: { canonical: `${siteConfig.url}/blog` },
}

interface BlogPageProps {
  searchParams: { category?: string; tag?: string }
}

export default function BlogPage({ searchParams }: BlogPageProps) {
  const allPosts = getAllPosts()
  const categories = getAllCategories()
  const tags = getAllTags()

  const selectedCategory = searchParams.category
  const selectedTag = searchParams.tag

  // 카테고리/태그 필터링 (서버)
  const filtered = allPosts.filter((post) => {
    if (selectedCategory && post.frontmatter.category !== selectedCategory) return false
    if (selectedTag && !post.frontmatter.tags?.includes(selectedTag)) return false
    return true
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-8">블로그</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* 검색 + 글 목록 (클라이언트 컴포넌트) */}
        <div className="flex-1 min-w-0">
          <BlogSearchSection posts={filtered} totalCount={allPosts.length} />
        </div>

        {/* 사이드바 */}
        <aside className="w-full lg:w-56 shrink-0">
          {/* 카테고리 */}
          {categories.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide mb-3">
                카테고리
              </h2>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/blog"
                    className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      !selectedCategory
                        ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 font-medium'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    전체
                  </Link>
                </li>
                {categories.map((cat) => (
                  <li key={cat}>
                    <Link
                      href={`/blog?category=${encodeURIComponent(cat)}`}
                      className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        selectedCategory === cat
                          ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 font-medium'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {cat}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 태그 */}
          {tags.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide mb-3">
                태그
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${
                      selectedTag === tag
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-brand-100 dark:hover:bg-brand-900/20'
                    }`}
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
