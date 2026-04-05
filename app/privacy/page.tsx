import type { Metadata } from 'next'
import { siteConfig } from '@/lib/config'

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: `${siteConfig.name}의 개인정보처리방침입니다.`,
  alternates: { canonical: `${siteConfig.url}/privacy` },
  robots: { index: false },
}

export default function PrivacyPage() {
  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">개인정보처리방침</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">시행일: {today}</p>

      <div className="prose dark:prose-invert max-w-none space-y-6 text-slate-700 dark:text-slate-300">
        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">1. 수집하는 개인정보 항목</h2>
          <p>본 블로그는 댓글 작성 시 닉네임, 이메일 주소를 수집합니다. Google Analytics를 통해 익명의 방문 통계(페이지뷰, 체류 시간 등)가 수집될 수 있습니다.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">2. 개인정보 수집 및 이용 목적</h2>
          <p>수집된 정보는 댓글 서비스 제공 및 사이트 개선을 위한 통계 분석 목적으로만 사용됩니다.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">3. 광고 서비스</h2>
          <p>본 블로그는 Google AdSense 광고 서비스를 사용할 수 있습니다. Google은 쿠키를 사용하여 사용자의 관심사에 맞는 광고를 제공합니다. Google의 광고 쿠키 사용을 원하지 않으시면 <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-brand-600 dark:text-brand-400">Google 광고 설정</a>에서 비활성화할 수 있습니다.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">4. 쿠키 사용</h2>
          <p>본 사이트는 사용자 경험 향상(다크모드 설정 저장 등)을 위해 쿠키를 사용합니다. 브라우저 설정에서 쿠키를 비활성화할 수 있으나, 일부 기능이 제한될 수 있습니다.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">5. 개인정보의 보유 및 이용 기간</h2>
          <p>댓글 데이터는 삭제 요청 시까지 보관됩니다. 삭제를 원하시면 <a href="/contact" className="text-brand-600 dark:text-brand-400">연락처</a>로 문의해주세요.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">6. 문의</h2>
          <p>개인정보 관련 문의는 <a href={`mailto:${siteConfig.author.email}`} className="text-brand-600 dark:text-brand-400">{siteConfig.author.email}</a>로 연락해주세요.</p>
        </section>
      </div>
    </div>
  )
}
