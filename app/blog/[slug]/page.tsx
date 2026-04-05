import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAllPosts, getPostBySlug } from '@/lib/posts'
import { serializeMdx } from '@/lib/mdx'
import { siteConfig } from '@/lib/config'
import { BlogPostJsonLd } from '@/components/seo/JsonLd'
import { Comments } from '@/components/blog/Comments'
import { MdxContent } from '@/components/blog/MdxContent'
import { PostActions } from '@/components/admin/PostActions'
import { PageViewTracker } from '@/components/blog/PageViewTracker'

// next-mdx-remote 클라이언트 MDXRemote는 SSG 환경에서 eval 충돌 → SSR(동적)로 전환
export const dynamic = 'force-dynamic'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPostBySlug(params.slug)
  if (!post) return {}

  const { frontmatter, slug } = post
  const ogImage = frontmatter.image
    ? `${siteConfig.url}${frontmatter.image}`
    : `${siteConfig.url}/og?title=${encodeURIComponent(frontmatter.title)}&description=${encodeURIComponent(frontmatter.description)}`

  return {
    title: frontmatter.title,
    description: frontmatter.description,
    keywords: frontmatter.tags,
    alternates: { canonical: `${siteConfig.url}/blog/${slug}` },
    openGraph: {
      type: 'article',
      title: frontmatter.title,
      description: frontmatter.description,
      url: `${siteConfig.url}/blog/${slug}`,
      publishedTime: frontmatter.date,
      tags: frontmatter.tags,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: frontmatter.title,
      description: frontmatter.description,
      images: [ogImage],
    },
  }
}

export default async function PostPage({ params }: Props) {
  const post = getPostBySlug(params.slug)
  if (!post || !post.frontmatter.published) notFound()

  // serialize on server (blockJS:false) → client MDXRemote → charts get full props
  const serialized = await serializeMdx(post.content)

  const date = new Date(post.frontmatter.date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <>
      <BlogPostJsonLd
        title={post.frontmatter.title}
        description={post.frontmatter.description}
        date={post.frontmatter.date}
        slug={post.slug}
        tags={post.frontmatter.tags}
        image={post.frontmatter.image}
      />

      <PageViewTracker slug={post.slug} title={post.frontmatter.title} />

      <article className="max-w-4xl mx-auto px-4 py-12">
        {/* 뒤로가기 */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mb-8 transition-colors"
        >
          ← 목록으로
        </Link>

        {/* 헤더 */}
        <header className="mb-10">
          {post.frontmatter.category && (
            <Link
              href={`/blog?category=${encodeURIComponent(post.frontmatter.category)}`}
              className="text-sm font-medium text-brand-600 dark:text-brand-400 mb-3 block"
            >
              {post.frontmatter.category}
            </Link>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50 mb-4 leading-tight">
            {post.frontmatter.title}
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-4">
            {post.frontmatter.description}
          </p>
          <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
            <time dateTime={post.frontmatter.date}>{date}</time>
            <span>·</span>
            <span>{post.readingTime}</span>
          </div>
          {post.frontmatter.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.frontmatter.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="px-2 py-1 text-xs rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-brand-100 dark:hover:bg-brand-900/20 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </header>

        <hr className="border-slate-200 dark:border-slate-700 mb-10" />

        {/* 본문 */}
        <div className="prose prose-slate dark:prose-invert max-w-none
          prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-slate-50
          prose-a:text-brand-600 dark:prose-a:text-brand-400 prose-a:no-underline hover:prose-a:underline
          prose-code:before:content-none prose-code:after:content-none
          prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
          prose-pre:bg-transparent prose-pre:p-0
        ">
          <MdxContent source={serialized} />
        </div>

        <hr className="border-slate-200 dark:border-slate-700 mt-10" />

        {/* 수정/삭제 버튼 */}
        <PostActions slug={post.slug} />

        <Comments slug={post.slug} />
      </article>
    </>
  )
}
