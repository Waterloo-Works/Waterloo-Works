import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { ogColors } from '@/lib/colors';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const title = searchParams.get('title') || 'Job Opportunity';
    const company = searchParams.get('company') || 'Company';
    const location = searchParams.get('location') || 'Location';
    const salary = searchParams.get('salary');

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
            backgroundColor: ogColors.background,
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
                color: ogColors.foreground,
                letterSpacing: '-0.02em',
              }}
            >
              Waterloo App
            </div>
          </div>

          {/* Main Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              maxWidth: '900px',
            }}
          >
            {/* Job Title */}
            <div
              style={{
                fontSize: 72,
                fontWeight: 700,
                color: ogColors.foreground,
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
              }}
            >
              {title}
            </div>

            {/* Company */}
            <div
              style={{
                fontSize: 48,
                fontWeight: 600,
                color: ogColors.primary,
                letterSpacing: '-0.02em',
              }}
            >
              {company}
            </div>

            {/* Details */}
            <div
              style={{
                display: 'flex',
                gap: '32px',
                fontSize: 32,
                color: ogColors.muted,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📍</span>
                <span>{location}</span>
              </div>
              {salary && (
                <>
                  <span>•</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>💰</span>
                    <span>{salary}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: 24,
              color: ogColors.muted,
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
