import type { Metadata } from 'next'
import { siteConfig } from '@/lib/config'

export const metadata: Metadata = {
  title: '연락처',
  description: '문의사항이나 협업 제안을 남겨주세요.',
  alternates: { canonical: `${siteConfig.url}/contact` },
}

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-4">연락처</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8">
        문의사항이나 협업 제안은 아래 이메일로 보내주세요. 빠른 시일 내에 답변드리겠습니다.
      </p>

      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 inline-block">
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">이메일</p>
        <a
          href={`mailto:${siteConfig.author.email}`}
          className="text-brand-600 dark:text-brand-400 font-medium hover:underline"
        >
          {siteConfig.author.email}
        </a>
      </div>

      {siteConfig.author.github && (
        <div className="mt-4 bg-slate-50 dark:bg-slate-800 rounded-xl p-6 inline-block ml-0 md:ml-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">GitHub</p>
          <a
            href={siteConfig.author.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-600 dark:text-brand-400 font-medium hover:underline"
          >
            {siteConfig.author.github.replace('https://', '')}
          </a>
        </div>
      )}
    </div>
  )
}
