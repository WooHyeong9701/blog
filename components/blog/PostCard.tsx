import Link from 'next/link'
import type { PostMeta } from '@/lib/posts'

interface PostCardProps {
  post: PostMeta
}

export function PostCard({ post }: PostCardProps) {
  const { slug, frontmatter, readingTime } = post
  const date = new Date(frontmatter.date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <article className="group border rounded-xl p-6 hover:border-brand-500 dark:hover:border-brand-400 transition-colors bg-white dark:bg-slate-900">
      <Link href={`/blog/${slug}`} className="block">
        {/* 카테고리 + 날짜 */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3">
          {frontmatter.category && (
            <>
              <span className="font-medium text-brand-600 dark:text-brand-400">
                {frontmatter.category}
              </span>
              <span>·</span>
            </>
          )}
          <time dateTime={frontmatter.date}>{date}</time>
          <span>·</span>
          <span>{readingTime}</span>
        </div>

        {/* 제목 */}
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
          {frontmatter.title}
        </h2>

        {/* 설명 */}
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-2">
          {frontmatter.description}
        </p>

        {/* 태그 */}
        {frontmatter.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {frontmatter.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </Link>
    </article>
  )
}
