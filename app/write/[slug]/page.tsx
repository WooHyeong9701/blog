import { PostEditor } from '@/components/admin/PostEditor'
import { notFound } from 'next/navigation'
import fs from 'fs'
import path from 'path'

interface Props {
  params: { slug: string }
}

export default function EditPage({ params }: Props) {
  const filePath = path.join(process.cwd(), 'content/posts', `${params.slug}.mdx`)
  if (!fs.existsSync(filePath)) notFound()

  const raw = fs.readFileSync(filePath, 'utf-8')

  return <PostEditor slug={params.slug} initialRaw={raw} />
}
