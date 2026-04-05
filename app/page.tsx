import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'
import { PostCard } from '@/components/blog/PostCard'
import { siteConfig } from '@/lib/config'

export default function Home() {
  const recentPosts = getAllPosts().slice(0, 5)

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {/* 히어로 */}
      <section className="mb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-50 mb-4">
          {siteConfig.name}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          {siteConfig.description}
        </p>
      </section>

      {/* 최근 글 */}
      {recentPosts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">최근 글</h2>
            <Link
              href="/blog"
              className="text-sm text-brand-600 dark:text-brand-400 hover:underline"
            >
              전체 보기 →
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            {recentPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      {recentPosts.length === 0 && (
        <div className="text-center py-16 text-slate-500 dark:text-slate-400">
          곧 첫 번째 글이 올라올 예정이에요.
        </div>
      )}
    </div>
  )
}
