import { siteConfig } from '@/lib/config'

interface WebsiteJsonLdProps {
  url?: string
}

export function WebsiteJsonLd({ url = siteConfig.url }: WebsiteJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    description: siteConfig.description,
    url,
    author: {
      '@type': 'Person',
      name: siteConfig.author.name,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${url}/blog?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface BlogPostJsonLdProps {
  title: string
  description: string
  date: string
  slug: string
  tags?: string[]
  image?: string
}

export function BlogPostJsonLd({
  title,
  description,
  date,
  slug,
  tags = [],
  image,
}: BlogPostJsonLdProps) {
  const url = `${siteConfig.url}/blog/${slug}`
  const imageUrl = image ? `${siteConfig.url}${image}` : `${siteConfig.url}/og?title=${encodeURIComponent(title)}`

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    datePublished: date,
    dateModified: date,
    url,
    image: imageUrl,
    author: {
      '@type': 'Person',
      name: siteConfig.author.name,
      url: siteConfig.url,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/favicon.ico`,
      },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    keywords: tags.join(', '),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
