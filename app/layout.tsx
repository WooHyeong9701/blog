import type { Metadata } from 'next'
import { Noto_Sans_KR, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { siteConfig } from '@/lib/config'
import { WebsiteJsonLd } from '@/components/seo/JsonLd'
import { Providers } from '@/components/layout/Providers'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

// 한국어 본문 폰트 — 나중에 Pretendard 로컬 폰트로 교체 가능
const notoSansKr = Noto_Sans_KR({
  variable: '--font-pretendard',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
})

// 코드 블록용 모노스페이스 폰트
const jetbrainsMono = JetBrains_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ['블로그', '개발', '기술'],
  authors: [{ name: siteConfig.author.name }],
  creator: siteConfig.author.name,
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: '/og',
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: ['/og'],
    creator: siteConfig.author.name,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteConfig.url,
    types: {
      'application/rss+xml': `${siteConfig.url}/feed.xml`,
    },
  },
  verification: {
    // google: 'your-google-site-verification-code',  ← Search Console 등록 후 여기에 입력
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang={siteConfig.language} suppressHydrationWarning>
      <body className={`${notoSansKr.variable} ${jetbrainsMono.variable} font-sans antialiased flex flex-col min-h-screen`}>
        <WebsiteJsonLd />
        <Providers>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
