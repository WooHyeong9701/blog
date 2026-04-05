import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'

const POSTS_DIR = path.join(process.cwd(), 'content/posts')

export interface PostFrontmatter {
  title: string
  description: string
  date: string
  tags: string[]
  category: string
  published: boolean
  image?: string
}

export interface Post {
  slug: string
  frontmatter: PostFrontmatter
  content: string
  readingTime: string
}

export interface PostMeta {
  slug: string
  frontmatter: PostFrontmatter
  readingTime: string
}

function getPostFiles(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return []
  return fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
}

export function getAllPosts(): PostMeta[] {
  return getPostFiles()
    .map((filename) => {
      const slug = filename.replace(/\.(mdx|md)$/, '')
      const filePath = path.join(POSTS_DIR, filename)
      const raw = fs.readFileSync(filePath, 'utf-8')
      const { data, content } = matter(raw)
      const frontmatter = data as PostFrontmatter

      if (!frontmatter.published) return null

      return {
        slug,
        frontmatter,
        readingTime: readingTime(content).text,
      }
    })
    .filter((post): post is PostMeta => post !== null)
    .sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime())
}

export function getPostBySlug(slug: string): Post | null {
  const extensions = ['mdx', 'md']
  let filePath: string | null = null

  for (const ext of extensions) {
    const candidate = path.join(POSTS_DIR, `${slug}.${ext}`)
    if (fs.existsSync(candidate)) {
      filePath = candidate
      break
    }
  }

  if (!filePath) return null

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)

  return {
    slug,
    frontmatter: data as PostFrontmatter,
    content,
    readingTime: readingTime(content).text,
  }
}

export function getAllTags(): string[] {
  const posts = getAllPosts()
  const tagSet = new Set<string>()
  posts.forEach((post) => post.frontmatter.tags?.forEach((tag) => tagSet.add(tag)))
  return Array.from(tagSet).sort()
}

export function getAllCategories(): string[] {
  const posts = getAllPosts()
  const catSet = new Set<string>()
  posts.forEach((post) => {
    if (post.frontmatter.category) catSet.add(post.frontmatter.category)
  })
  return Array.from(catSet).sort()
}
