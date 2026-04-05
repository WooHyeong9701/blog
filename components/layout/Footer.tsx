import Link from 'next/link'
import { siteConfig } from '@/lib/config'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t mt-auto">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-400">
          <p>
            © {year} {siteConfig.author.name}. All rights reserved.
          </p>
          <nav className="flex items-center gap-4">
            <Link href="/about" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
              About
            </Link>
            <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
              개인정보처리방침
            </Link>
            <Link href="/feed.xml" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
              RSS
            </Link>
            {siteConfig.author.github && (
              <a
                href={siteConfig.author.github}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
              >
                GitHub
              </a>
            )}
          </nav>
        </div>
      </div>
    </footer>
  )
}
