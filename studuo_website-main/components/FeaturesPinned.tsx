'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'

type FeatureState = {
  title: string
  blurb: string
  image: string
}

const STATES: FeatureState[] = [
  {
    title: 'Find Matches',
    blurb: 'Discover creators aligned with your sound and session goals.',
    image: '/assets/mockup/2.png'
  },
  {
    title: 'Book Instantly',
    blurb: 'Real-time availability and instant confirmations.',
    image: '/assets/mockup/3.png'
  },
  {
    title: 'Fair Pricing',
    blurb: 'Transparent rates and secure payments.',
    image: '/assets/mockup/4.png'
  },
  {
    title: 'Pro Tools',
    blurb: 'Manage sessions, files, and feedback in one place.',
    image: '/assets/mockup/9.png'
  }
]

export default function FeaturesPinned() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const [isIOS, setIsIOS] = useState(false)

  // Detect iOS to adjust sticky behavior and viewport sizing
  useEffect(() => {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
    setIsIOS(/iPad|iPhone|iPod/.test(ua))
  }, [])

  // Scroll progress over the whole section (~500vh)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end']
  })

  // Map progress to a 0..1 sequence over 4 states
  const activeIndex = useTransform(scrollYProgress, (p) => {
    const idx = Math.min(3, Math.floor(p * 4))
    return idx
  })

  // Per-state local progress for crossfades
  const localProgress = useTransform(scrollYProgress, (p) => {
    const seg = Math.min(3, Math.floor(p * 4))
    const start = seg / 4
    const end = (seg + 1) / 4
    const t = Math.max(0, Math.min(1, (p - start) / (end - start)))
    return t
  })

  const containerStyles = useMemo(() => ({
    height: '500svh',
    backgroundColor: '#000000'
  } as const), [])

  const stickyStyles = useMemo(() => ({
    position: isIOS ? ('sticky' as const) : ('sticky' as const),
    top: 0,
    height: '100svh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }), [isIOS])

  return (
    <div ref={sectionRef} style={containerStyles}>
      <div ref={stickyRef} style={stickyStyles}>
        <div
          className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-6"
          style={{ pointerEvents: 'none' }}
        >
          {/* Image side */}
          <div className="relative w-full aspect-[4/3] md:aspect-[3/2] rounded-3xl overflow-hidden" style={{ backgroundColor: '#0b0b0b' }}>
            {/* Crossfade images */}
            <AnimatePresence initial={false} mode="wait">
              <motion.img
                key={(STATES as any)[0] && (activeIndex as unknown as number)}
                src={STATES[(activeIndex as unknown as number) ?? 0].image}
                alt={STATES[(activeIndex as unknown as number) ?? 0].title}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="absolute inset-0 w-full h-full object-contain"
                style={{ padding: 'clamp(8px, 2vw, 24px)' }}
              />
            </AnimatePresence>
          </div>

          {/* Text side */}
          <div className="flex flex-col gap-3 md:gap-4" style={{ color: '#CFD5C9' }}>
            <AnimatePresence mode="wait">
              <motion.h3
                key={`title-${(activeIndex as unknown as number) ?? 0}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="text-[clamp(20px,5vw,40px)] font-bold"
              >
                {STATES[(activeIndex as unknown as number) ?? 0].title}
              </motion.h3>
              <motion.p
                key={`blurb-${(activeIndex as unknown as number) ?? 0}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.45, ease: 'easeOut', delay: 0.05 }}
                className="text-[clamp(14px,3.2vw,18px)] opacity-85"
                style={{ maxWidth: 560 }}
              >
                {STATES[(activeIndex as unknown as number) ?? 0].blurb}
              </motion.p>
            </AnimatePresence>

            {/* Progress dots */}
            <div className="flex gap-2 pt-3" aria-hidden>
              {STATES.map((_, i) => (
                <motion.span
                  key={i}
                  style={{ width: 8, height: 8, borderRadius: 9999, backgroundColor: '#333' }}
                  animate={{ backgroundColor: (activeIndex as unknown as number) === i ? '#ED7B32' : '#333' }}
                  transition={{ duration: 0.3 }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


