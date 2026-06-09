import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { Nav } from '@/components/Nav'
import { BottomNav } from '@/components/BottomNav'

export const metadata: Metadata = {
  title: 'Furrlet — Trusted Dog Walkers Near You',
  description: 'Find verified dog walkers in your city or earn money walking dogs. Book in under 2 minutes. UPI & card payments accepted.',
  keywords: ['dog walker', 'dog walking', 'pet care', 'dog walker near me', 'dog walking india', 'furrlet'],
  authors: [{ name: 'Furrlet', url: 'https://furrlet.in' }],
  metadataBase: new URL('https://furrlet.in'),
  openGraph: {
    title: 'Furrlet — Trusted Dog Walkers Near You',
    description: 'Find verified dog walkers in your city or earn money walking dogs. Book in under 2 minutes.',
    url: 'https://furrlet.in',
    siteName: 'Furrlet',
    images: [{ url: '/og', width: 1200, height: 630, alt: 'Furrlet — Trusted Dog Walkers Near You' }],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Furrlet — Trusted Dog Walkers Near You',
    description: 'Find verified dog walkers in your city or earn money walking dogs.',
    images: ['/og'],
  },
  icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
  robots: { index: true, follow: true },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#f59e0b',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <Providers>
          <Nav />
          <main className="pb-20 sm:pb-0">{children}</main>
          <BottomNav />
        </Providers>
      </body>
    </html>
  )
}
