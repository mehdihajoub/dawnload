'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type FeatureItem = {
  title: string
  blurb: string
  framesPath: (index: number) => string
  frameCount: number
  tint?: string
  staticFallback?: string
}

const FEATURES: FeatureItem[] = [
  {
    title: 'Find Matches',
    blurb: 'Discover creators aligned with your sound and session goals.',
    framesPath: (i) => `/assets/mockup/sequence/feature1/${String(i).padStart(4, '0')}.webp`,
    frameCount: 24,
    tint: 'linear-gradient(180deg, rgba(255,91,4,0.20), rgba(0,0,0,0))',
    staticFallback: '/assets/mockup/2.png'
  },
  {
    title: 'Book Instantly',
    blurb: 'Real-time availability and instant confirmations.',
    framesPath: (i) => `/assets/mockup/sequence/feature2/${String(i).padStart(4, '0')}.webp`,
    frameCount: 24,
    tint: 'linear-gradient(180deg, rgba(237,123,50,0.20), rgba(0,0,0,0))',
    staticFallback: '/assets/mockup/3.png'
  },
  {
    title: 'Fair Pricing',
    blurb: 'Transparent rates and secure payments.',
    framesPath: (i) => `/assets/mockup/sequence/feature3/${String(i).padStart(4, '0')}.webp`,
    frameCount: 24,
    tint: 'linear-gradient(180deg, rgba(7,80,86,0.20), rgba(0,0,0,0))',
    staticFallback: '/assets/mockup/4.png'
  },
  {
    title: 'Pro Tools',
    blurb: 'Manage sessions, files, and feedback in one place.',
    framesPath: (i) => `/assets/mockup/sequence/feature4/${String(i).padStart(4, '0')}.webp`,
    frameCount: 24,
    tint: 'linear-gradient(180deg, rgba(0,0,0,0.20), rgba(0,0,0,0))',
    staticFallback: '/assets/mockup/9.png'
  }
]

const SECTION_MULTIPLIER = 5 // ~500vh

export default function ScrollFeatureShowcase() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [inView, setInView] = useState(false)
  const [parallaxOffset, setParallaxOffset] = useState(0)

  // Setup IntersectionObserver to only animate when in view
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          setInView(entry.isIntersecting)
        }
      },
      { threshold: 0.1 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Scroll handler logic
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    let raf = 0

    const onScroll = () => {
      if (!inView) return
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect()
        // Total scrollable distance: section height minus one viewport
        const sectionHeight = window.innerHeight * SECTION_MULTIPLIER
        const scrollableHeight = sectionHeight - window.innerHeight
        // Distance scrolled from when section top enters viewport (top of screen)
        const scrolled = Math.min(Math.max(-rect.top, 0), scrollableHeight)
        const progress = scrolled / scrollableHeight // 0..1 over section

        // 4 equal segments
        const segment = Math.min(3, Math.floor(progress * 4))
        setActiveIndex(segment)

        const segmentStart = segment / 4
        const segmentEnd = (segment + 1) / 4
        const localT = Math.min(1, Math.max(0, (progress - segmentStart) / (segmentEnd - segmentStart)))

        // Parallax offset for mockup (moves up as you scroll through each feature)
        const parallaxRange = 60 // pixels
        setParallaxOffset(localT * parallaxRange)
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    onScroll()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [inView])

  return (
    <section
      ref={containerRef}
      aria-label="Feature showcase"
      className="relative"
      style={{ height: `calc(${SECTION_MULTIPLIER} * 100vh)` }}
    >
      {/* Dynamic feature title - fixed left below navbar */}
      {inView && (
        <div
          className="fixed left-6 z-[60]"
          style={{ 
            top: 'calc(env(safe-area-inset-top, 0px) + 80px)',
            fontFamily: 'AeonikPro, sans-serif'
          }}
        >
          <motion.h2
            key={activeIndex}
            style={{
              color: '#E2DFD6',
              fontSize: 'clamp(24px, 7vw, 48px)',
              fontWeight: 700,
              margin: 0
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {FEATURES[activeIndex].title}
          </motion.h2>
        </div>
      )}

      {/* Skip link - fixed right below navbar */}
      {inView && (
        <a
          href="#features"
          className="fixed right-6 z-[60] underline text-sm"
          style={{ 
            color: '#E2DFD6', 
            opacity: 0.4,
            top: 'calc(env(safe-area-inset-top, 0px) + 80px)',
            fontFamily: 'AeonikPro, sans-serif'
          }}
        >
          Skip animation
        </a>
      )}

      {/* iPhone Mockup with parallax - centered below text */}
      {inView && (
        <div
          className="fixed z-[50]"
          style={{ 
            top: `calc(env(safe-area-inset-top, 0px) + 240px)`,
            left: '50%',
            transform: `translateX(-50%) translateY(-${parallaxOffset}px)`,
            width: 'min(320px, 70vw)',
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <motion.img
            key={activeIndex}
            src={FEATURES[activeIndex]?.staticFallback || FEATURES[0].staticFallback!}
            alt={`${FEATURES[activeIndex].title} preview`}
            style={{ 
              width: '100%',
              height: 'auto',
              filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.5))'
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      )}

      {/* Description text - top left, only render while in view */}
      {inView && (
        <div
          className="fixed left-6 z-[55]"
          style={{
            top: 'calc(env(safe-area-inset-top, 0px) + 120px)'
          }}
          aria-live="polite"
        >
          <AnimatePresence mode="wait">
            <motion.p
              key={activeIndex}
              style={{
                fontFamily: 'AeonikPro, sans-serif',
                fontWeight: 300,
                color: '#CFD5C9',
                opacity: 0.85,
                fontSize: 'clamp(14px, 3.5vw, 18px)',
                marginTop: '0.5rem',
                textAlign: 'left',
                maxWidth: '400px'
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              {FEATURES[activeIndex].blurb}
            </motion.p>
          </AnimatePresence>
        </div>
      )}
    </section>
  )
}


