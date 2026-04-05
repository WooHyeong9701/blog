import type { Metadata } from 'next'
import { siteConfig } from '@/lib/config'

export const metadata: Metadata = {
  title: 'About',
  description: `${siteConfig.author.name}에 대해 소개합니다.`,
  alternates: { canonical: `${siteConfig.url}/about` },
}

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-8">About</h1>

      <div className="prose dark:prose-invert max-w-none">
        <h2>안녕하세요!</h2>
        <p>
          이 블로그는 개발, 기술, 그리고 일상의 생각들을 기록하는 공간입니다.
        </p>

        <h2>이 블로그에서 다루는 내용</h2>
        <ul>
          <li>웹 개발 (Next.js, React, TypeScript)</li>
          <li>백엔드 및 인프라</li>
          <li>개발 경험과 회고</li>
          <li>기술 트렌드 분석</li>
        </ul>

        <h2>연락처</h2>
        <p>
          문의사항이나 협업 제안은 <a href="/contact">연락처 페이지</a>를 통해 남겨주세요.
        </p>
      </div>
    </div>
  )
}
