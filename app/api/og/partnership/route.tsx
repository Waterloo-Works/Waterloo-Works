import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { ogColors } from '@/lib/colors';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const companyName = searchParams.get('company') || 'Company';
    const companyLogo = searchParams.get('logo');

    // Check if logo is a valid URL and not a broken favicon
    const hasValidLogo = companyLogo &&
      companyLogo.startsWith('http') &&
      !companyLogo.includes('favicon.ico') &&
      !companyLogo.includes('s2/favicons');

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000000',
            backgroundImage: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            padding: '80px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            position: 'relative',
          }}
        >
          {/* Partnership Visual */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '60px',
              marginBottom: '60px',
            }}
          >
            {/* Company Logo Container - only show if we have a valid logo */}
            {hasValidLogo ? (
              <div
                style={{
                  width: '180px',
                  height: '180px',
                  borderRadius: '24px',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                }}
              >
                <img
                  src={companyLogo}
                  alt={`${companyName} logo`}
                  width="140"
                  height="140"
                  style={{
                    objectFit: 'contain',
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  width: '180px',
                  height: '180px',
                  borderRadius: '24px',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Georgia, serif',
                  fontStyle: 'italic',
                  fontSize: '48px',
                  fontWeight: 700,
                  color: '#18181b',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                }}
              >
                {companyName.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Handshake Emoji */}
            <div
              style={{
                fontSize: 80,
                display: 'flex',
              }}
            >
              🤝
            </div>

            {/* Waterloo.app Logo Container */}
            <div
              style={{
                width: '180px',
                height: '180px',
                borderRadius: '24px',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Georgia, serif',
                fontStyle: 'italic',
                fontSize: '32px',
                fontWeight: 600,
                color: '#18181b',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              }}
            >
              waterloo.app
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: '#ffffff',
              textAlign: 'center',
              marginBottom: '24px',
              letterSpacing: '-0.02em',
              maxWidth: '900px',
            }}
          >
            Partnership with {companyName}
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 32,
              color: 'rgba(255, 255, 255, 0.8)',
              textAlign: 'center',
              maxWidth: '800px',
              lineHeight: 1.4,
            }}
          >
            Matching cracked Canadian youth with companies ready to match their ambition
          </div>

          {/* Footer */}
          <div
            style={{
              position: 'absolute',
              bottom: '60px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: 24,
              color: 'rgba(255, 255, 255, 0.6)',
            }}
          >
            <span>waterloo.app</span>
            <span>•</span>
            <span>Starting with UWaterloo</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Partnership OG Image generation error:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
