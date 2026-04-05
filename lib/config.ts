export const siteConfig = {
  name: '내 블로그',
  description: '개발, 기술, 생각을 기록하는 공간입니다.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com',
  author: {
    name: '홍길동',
    email: 'you@example.com',
    github: 'https://github.com/yourusername',
  },
  locale: 'ko_KR',
  language: 'ko',
} as const

export type SiteConfig = typeof siteConfig
