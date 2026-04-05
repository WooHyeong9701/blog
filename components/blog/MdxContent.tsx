'use client'

import { MDXRemote } from 'next-mdx-remote'
import type { MDXRemoteSerializeResult } from 'next-mdx-remote'
import { mdxComponents } from './MdxComponents'

interface Props {
  source: MDXRemoteSerializeResult
}

export function MdxContent({ source }: Props) {
  return <MDXRemote {...source} components={mdxComponents} />
}
