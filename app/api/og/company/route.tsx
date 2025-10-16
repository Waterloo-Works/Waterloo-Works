import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const name = searchParams.get('name') || 'Company';
    const jobCount = searchParams.get('jobCount') || '0';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            backgroundColor: '#18181b',
            padding: '80px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: 'white',
                letterSpacing: '-0.02em',
              }}
            >
              Waterloo Works
            </div>
          </div>

          {/* Main Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '32px',
              maxWidth: '900px',
            }}
          >
            {/* Company Name */}
            <div
              style={{
                fontSize: 80,
                fontWeight: 700,
                color: 'white',
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
              }}
            >
              {name}
            </div>

            {/* Job Count */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                fontSize: 48,
                fontWeight: 600,
                color: '#a1a1aa',
              }}
            >
              <span style={{ color: '#22c55e' }}>{jobCount}</span>
              <span>{jobCount === '1' ? 'Open Position' : 'Open Positions'}</span>
            </div>

            {/* CTA */}
            <div
              style={{
                fontSize: 32,
                color: '#71717a',
                marginTop: '24px',
              }}
            >
              View all opportunities →
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: 24,
              color: '#71717a',
            }}
          >
            <span>🎓</span>
            <span>Waterloo Student Jobs & Internships</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('OG Image generation error:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
