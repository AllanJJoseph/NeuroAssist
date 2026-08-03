import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { gsap } from 'gsap'

export type PillNavItem = {
  label: string
  href: string
  ariaLabel?: string
}

export interface PillNavProps {
  items: PillNavItem[]
  className?: string
  initialLoadAnimation?: boolean
}

export function PillNav({ items, className = '', initialLoadAnimation = true }: PillNavProps) {
  const location = useLocation()
  const navRef = useRef<HTMLElement | null>(null)
  const pillRef = useRef<HTMLSpanElement | null>(null)
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([])

  const activeIndex = useMemo(() => {
    const index = items.findIndex((item) => item.href === location.pathname)
    return index >= 0 ? index : 0
  }, [items, location.pathname])

  const animatePill = useCallback(() => {
    const nav = navRef.current
    const pill = pillRef.current
    const activeItem = itemRefs.current[activeIndex]

    if (!nav || !pill || !activeItem) return

    const navRect = nav.getBoundingClientRect()
    const itemRect = activeItem.getBoundingClientRect()

    gsap.to(pill, {
      x: itemRect.left - navRect.left - 4,
      width: itemRect.width,
      duration: 0.35,
      ease: 'power3.out',
      overwrite: 'auto',
    })
  }, [activeIndex])

  useLayoutEffect(() => {
    animatePill()
  }, [animatePill])

  useEffect(() => {
    const handleResize = () => animatePill()
    window.addEventListener('resize', handleResize)

    if (document.fonts) {
      document.fonts.ready.then(animatePill).catch(() => {})
    }

    return () => window.removeEventListener('resize', handleResize)
  }, [animatePill])

  useEffect(() => {
    if (!initialLoadAnimation) return

    const nav = navRef.current
    if (!nav) return

    gsap.fromTo(nav, { opacity: 0, y: -4 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' })
  }, [initialLoadAnimation])

  return (
    <nav ref={navRef} aria-label="Primary" className={`relative rounded-full border border-black bg-white px-1 py-1 shadow-sm ${className}`}>
      <span ref={pillRef} aria-hidden="true" className="pointer-events-none absolute inset-y-1 left-1 rounded-full bg-black shadow-soft" />
      <ul className="relative z-10 flex items-center gap-1" role="list">
        {items.map((item, index) => {
          const isActive = index === activeIndex

          return (
            <li key={item.href} className="shrink-0">
              <Link
                to={item.href}
                aria-label={item.ariaLabel ?? item.label}
                aria-current={isActive ? 'page' : undefined}
                ref={(element) => {
                  itemRefs.current[index] = element
                }}
                className={[
                  'inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:px-5',
                  isActive ? '!text-white' : '!text-black hover:!text-black',
                ].join(' ')}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
