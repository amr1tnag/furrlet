import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { Nav } from '@/components/Nav'

export const metadata: Metadata = {
  title: 'Furrlet - Dog Walking Marketplace',
  description: 'Find trusted dog walkers or offer your walking services',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <Providers>
          <Nav />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  )
}
