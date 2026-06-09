import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div style={{
        width: '1200px', height: '630px',
        background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fff7ed 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: 'sans-serif', position: 'relative',
      }}>
        {/* Background blobs */}
        <div style={{ position: 'absolute', top: 40, right: 80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(251,191,36,0.15)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: 40, left: 80, width: 400, height: 400, borderRadius: '50%', background: 'rgba(249,115,22,0.1)', filter: 'blur(80px)' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <div style={{ fontSize: '64px' }}>🐾</div>
          <div style={{ fontSize: '56px', fontWeight: 900, color: '#111827', letterSpacing: '-2px' }}>Furrlet</div>
        </div>

        {/* Headline */}
        <div style={{ fontSize: '42px', fontWeight: 800, color: '#111827', textAlign: 'center', lineHeight: 1.2, marginBottom: '20px', maxWidth: '800px' }}>
          Trusted Dog Walkers<br />Near You
        </div>

        {/* Subtext */}
        <div style={{ fontSize: '22px', color: '#6b7280', textAlign: 'center', maxWidth: '600px', marginBottom: '40px' }}>
          Book a verified walker in under 2 minutes.<br />UPI · Cards · Netbanking accepted.
        </div>

        {/* CTA pill */}
        <div style={{ background: '#f59e0b', color: 'white', fontSize: '20px', fontWeight: 700, padding: '16px 40px', borderRadius: '16px' }}>
          furrlet.in
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
