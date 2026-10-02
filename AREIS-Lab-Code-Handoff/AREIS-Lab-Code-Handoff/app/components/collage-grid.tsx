'use client'

import { useEffect, useRef, type ReactNode } from 'react'

export function CollageGrid({ children }: { children: ReactNode }) {
  const grid = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!grid.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return

    // Reveal each photograph once, including tiles reached later on a phone.
    // The default CSS stays visible when JavaScript or motion is unavailable.
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('collage-enter')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.15 })

    Array.from(grid.current.children).forEach(photo => observer.observe(photo))
    return () => observer.disconnect()
  }, [])

  return <div className="collage-grid" ref={grid}>{children}</div>
}
