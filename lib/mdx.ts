import rehypePrettyCode from 'rehype-pretty-code'
import type { Options } from 'rehype-pretty-code'
import { serialize } from 'next-mdx-remote/serialize'

const prettyCodeOptions: Options = {
  theme: {
    dark: 'github-dark',
    light: 'github-light',
  },
  keepBackground: false,
  onVisitLine(node) {
    if (!node.children || node.children.length === 0) {
      node.children = [{ type: 'text', value: ' ' }]
    }
  },
  onVisitHighlightedLine(node) {
    if (!node.properties.className) node.properties.className = []
    node.properties.className.push('highlighted')
  },
  onVisitHighlightedChars(node) {
    node.properties.className = ['word']
  },
}

/**
 * 서버에서 MDX를 컴파일 후 직렬화. blockJS: false로 배열/객체 props 허용.
 * 결과를 클라이언트 MDXRemote에 전달하면 charts에 모든 props가 올바르게 전달됨.
 */
export async function serializeMdx(source: string) {
  return serialize(source, {
    parseFrontmatter: false,
    blockJS: false,
    mdxOptions: {
      rehypePlugins: [[rehypePrettyCode, prettyCodeOptions] as any],
    },
  })
}
