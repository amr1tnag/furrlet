'use client'
import { usePathname } from 'next/navigation'

export function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isHome = pathname === '/'
  return <main className={isHome ? '' : 'pb-20 sm:pb-0'}>{children}</main>
}
