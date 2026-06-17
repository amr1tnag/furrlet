'use client'
import { usePathname } from 'next/navigation'

export function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const noChrome = pathname === '/' || pathname.startsWith('/auth')
  return <main className={noChrome ? '' : 'pb-20 sm:pb-0'}>{children}</main>
}
