import { useEffect, useRef } from 'react'

export function useInView(threshold = 0.1) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible')
      }),
      { threshold }
    )
    const el = ref.current
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return ref
}
