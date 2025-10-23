'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import localFont from 'next/font/local'

const botch = localFont({
  src: '../public/fonts/Botch.otf',
  display: 'swap',
  variable: '--font-botch'
})

interface CardProps {
  title: string
  baseColor: string
  index: number
  isScrolled: boolean
  imageSrc: string
  folderColor: string
  textColor: string
  showCards: boolean
  useGrid?: boolean
}

export default function Card({ title, baseColor, index, isScrolled, imageSrc, folderColor, textColor, showCards, useGrid = false }: CardProps) {
  const imgRef = useRef<HTMLDivElement | null>(null)
  const [hasMounted, setHasMounted] = useState(false)
  const { scrollYProgress } = useScroll({ target: hasMounted ? imgRef : undefined, offset: ['start end', 'end start'] })
  
  useEffect(() => {
    setHasMounted(true)
  }, [])
  // Move image only downward to avoid cropping the top
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '12%'])
  const cardVariants = useGrid
    ? {
        hidden: { opacity: 0, y: 12 },
        shown: { opacity: 1, y: 0 },
        scrolled: { opacity: 1, y: 0 },
      }
    : {
        // Page load animation - all cards start hidden
        hidden: {
          y: 20, // All cards start at first card position
          zIndex: 10 - index,
          opacity: 0, // All cards hidden initially
        },
        // Show animation - cards slide to their positions
        shown: {
          y: 20 + index * 60, // Slide to overlapping positions
          zIndex: 10 - index,
          opacity: 1,
        },
        // Scroll animation - cards spread out
        scrolled: {
          y: 20 + index * 200, // Spread out when scrolled
          zIndex: 10 - index,
          opacity: 1,
        },
      }

  // Grid expansion is orchestrated by parent via shared layoutId wrappers.

  // Adjust title font size for "Underground" to make it smaller and properly centered
  const baseTitleFontSize = useGrid ? 'clamp(16px, 5.2vw, 24px)' : 'clamp(20px, 7vw, 38px)'
  const undergroundTitleFontSize = useGrid ? 'clamp(14px, 4.5vw, 20px)' : 'clamp(16px, 5.5vw, 30px)'
  const computedTitleFontSize = title.trim().toLowerCase() === 'underground'
    ? undergroundTitleFontSize
    : baseTitleFontSize

  return (
    <motion.div
      className={
        useGrid
          ? `relative w-full h-full rounded-2xl shadow-2xl`
          : `absolute inset-x-0 mx-auto w-[90%] max-w-[400px] md:max-w-[460px] rounded-2xl shadow-2xl h-64 md:h-72`
      }
      style={{
        boxShadow: '0 12px 25px -12px rgba(0, 0, 0, 0.25), 0 8px 12px -5px rgba(0, 0, 0, 0.12)',
        backgroundColor: baseColor,
        ...(useGrid
          ? {
              transformOrigin: 'center',
            }
          : {}),
      }}
      variants={cardVariants}
      initial="hidden"
      animate={
        useGrid
          ? (showCards ? 'shown' : 'hidden')
          : (!showCards ? 'hidden' : isScrolled ? 'scrolled' : 'shown')
      }
      transition={{
        duration: useGrid ? 0.85 : index === 0 ? 0.8 : 0.6,
        ease: 'easeOut',
        delay: useGrid ? (showCards ? index * 0.22 : 0) : showCards ? (index === 0 ? 0 : 0.8 + (index - 1) * 0.15) : 0
      }}
      // Click handling is managed by parent wrappers to leverage shared layoutId
    >
      {/* New Layering */}
      {/* 2) Bottom rectangular bar (~20% of card height) */}
      <div className="absolute left-0 right-0 bottom-0" style={{ height: '20%' }}>
        <div className="w-full h-full rounded-b-2xl" style={{ backgroundColor: folderColor }} />
      </div>

      {/* 3) Image layer with parallax: only top half visible, emerging from the bar */}
      <div ref={imgRef} className="absolute overflow-hidden" style={{ left: 18, right: 18, bottom: 12, height: '65%', zIndex: 2 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img
          src={imageSrc}
          alt="card visual"
          className="w-full h-full object-cover object-[50%_0%]"
          style={{ y }}
        />
      </div>

      {/* Small black rectangle with same rounded corners, full width minus spacing */}
      <div
        className="absolute rounded-2xl"
        style={{ left: 5, right: 5, bottom: 5, height: 60, backgroundColor: '#000', zIndex: 1 }}
      />

      {/* 1) Text moved to upper part */}
      <div className="absolute left-0 right-0 top-3 px-4 md:px-6 z-10 flex items-center justify-center">
        <h3
          className={`font-semibold tracking-tight leading-tight text-center ${botch.className}`}
          style={{
            color: textColor,
            fontSize: computedTitleFontSize
          }}
        >
          {title}
        </h3>
      </div>
    </motion.div>
  )
}
