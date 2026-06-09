import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function GET() {
  return new ImageResponse(
    (
      <div style={{
        width: '1200px', height: '630px',
        background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #fff7ed 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: 'sans-serif',
      }}>
        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '24px',
            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '40px', color: 'white', fontWeight: 900,
          }}>F</div>
          <div style={{ fontSize: '60px', fontWeight: 900, color: '#111827', letterSpacing: '-2px' }}>Furrlet</div>
        </div>

        {/* Headline */}
        <div style={{ fontSize: '44px', fontWeight: 800, color: '#111827', textAlign: 'center', lineHeight: 1.15, marginBottom: '20px', maxWidth: '820px' }}>
          Trusted Dog Walkers Near You
        </div>

        {/* Subtext */}
        <div style={{ fontSize: '22px', color: '#6b7280', textAlign: 'center', maxWidth: '620px', marginBottom: '44px', lineHeight: 1.5 }}>
          Book a verified walker in under 2 minutes. UPI, Cards & Netbanking accepted.
        </div>

        {/* Pills */}
        <div style={{ display: 'flex', gap: '16px' }}>
          {['Find a Walker', 'Earn Money Walking Dogs', 'India\'s Dog Walking App'].map(t => (
            <div key={t} style={{
              background: 'white', border: '1px solid #fde68a',
              color: '#92400e', fontSize: '16px', fontWeight: 600,
              padding: '10px 20px', borderRadius: '99px',
            }}>{t}</div>
          ))}
        </div>

        {/* Domain */}
        <div style={{ marginTop: '40px', background: '#f59e0b', color: 'white', fontSize: '20px', fontWeight: 700, padding: '14px 36px', borderRadius: '14px' }}>
          furrlet.in
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
