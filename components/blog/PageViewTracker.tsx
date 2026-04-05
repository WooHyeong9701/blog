'use client'

import { useEffect } from 'react'

interface Props {
  slug: string
  title: string
}

export function PageViewTracker({ slug, title }: Props) {
  useEffect(() => {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, title }),
    }).catch(() => {})
  }, [slug, title])

  return null
}
