import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { siteConfig } from '@/lib/config'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const title = searchParams.get('title') ?? siteConfig.name
  const description = searchParams.get('description') ?? siteConfig.description

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* 상단 사이트명 */}
        <div
          style={{
            fontSize: 24,
            color: '#94a3b8',
            marginBottom: 32,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          {siteConfig.name}
        </div>

        {/* 제목 */}
        <div
          style={{
            fontSize: title.length > 30 ? 52 : 64,
            fontWeight: 700,
            color: '#f8fafc',
            lineHeight: 1.2,
            marginBottom: 24,
          }}
        >
          {title}
        </div>

        {/* 설명 */}
        {description && description !== siteConfig.name && (
          <div
            style={{
              fontSize: 28,
              color: '#94a3b8',
              lineHeight: 1.5,
              maxWidth: 900,
            }}
          >
            {description.length > 80 ? description.slice(0, 80) + '...' : description}
          </div>
        )}

        {/* 하단 URL */}
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            right: 80,
            fontSize: 20,
            color: '#475569',
          }}
        >
          {siteConfig.url.replace('https://', '')}
        </div>

        {/* 우측 장식선 */}
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: 8,
            height: '100%',
            background: 'linear-gradient(180deg, #0ea5e9 0%, #6366f1 100%)',
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  )
}
