import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
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
          {/* Header */}
          <div
            style={{
              position: 'absolute',
              top: '60px',
              left: '80px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div
              style={{
                fontFamily: 'Georgia, serif',
                fontStyle: 'italic',
                fontSize: 32,
                fontWeight: 600,
                color: '#ffffff',
                letterSpacing: '-0.02em',
              }}
            >
              waterloo.app
            </div>
          </div>

          {/* Main Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '40px',
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '24px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '64px',
                border: '2px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              📅
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: 72,
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '-0.03em',
                maxWidth: '900px',
                lineHeight: 1.1,
              }}
            >
              Waterloo Community Events
            </div>

            {/* Subtitle */}
            <div
              style={{
                fontSize: 36,
                color: 'rgba(255, 255, 255, 0.8)',
                maxWidth: '800px',
                lineHeight: 1.3,
              }}
            >
              Connect with Waterloo students and alumni at meetups and events
            </div>

            {/* Features */}
            <div
              style={{
                display: 'flex',
                gap: '60px',
                marginTop: '20px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div style={{ fontSize: 48 }}>🌉</div>
                <div
                  style={{
                    fontSize: 20,
                    color: 'rgba(255, 255, 255, 0.7)',
                  }}
                >
                  Bay Area
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div style={{ fontSize: 48 }}>🍁</div>
                <div
                  style={{
                    fontSize: 20,
                    color: 'rgba(255, 255, 255, 0.7)',
                  }}
                >
                  Waterloo
                </div>
              </div>
            </div>
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
              color: 'rgba(255, 255, 255, 0.5)',
            }}
          >
            <span>Community meetups</span>
            <span>•</span>
            <span>Networking events</span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Events OG Image generation error:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
