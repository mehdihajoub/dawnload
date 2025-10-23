'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import localFont from 'next/font/local'
import PinterestGallery from './PinterestGallery'

const huffer = localFont({
  src: '../public/fonts/Huffer.otf',
  display: 'swap',
  variable: '--font-huffer'
})

const deFonte = localFont({
  src: '../public/fonts/DeFontePlus-Leger/DeFontePlus-Leger.ttf',
  display: 'swap',
  variable: '--font-defonte'
})

export default function CardHolder() {
  const headerRef = useRef<HTMLDivElement>(null)
  
  // Track scroll progress of the header
  const { scrollYProgress } = useScroll({
    target: headerRef,
    offset: ['start 80%', 'start 20%']
  })
  
  // Create opacity and y transforms for each element
  const titleOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1])
  const titleY = useTransform(scrollYProgress, [0, 0.2], [20, 0])
  
  const rect1Opacity = useTransform(scrollYProgress, [0.15, 0.35], [0, 1])
  const rect1Scale = useTransform(scrollYProgress, [0.15, 0.35], [0, 1])
  
  const rect2Opacity = useTransform(scrollYProgress, [0.3, 0.5], [0, 1])
  const rect2Scale = useTransform(scrollYProgress, [0.3, 0.5], [0, 1])
  
  const rect3Opacity = useTransform(scrollYProgress, [0.45, 0.65], [0, 1])
  const rect3Scale = useTransform(scrollYProgress, [0.45, 0.65], [0, 1])
  
  const subtitleOpacity = useTransform(scrollYProgress, [0.6, 0.8], [0, 1])
  const subtitleY = useTransform(scrollYProgress, [0.6, 0.8], [20, 0])

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col" style={{ backgroundColor: '#000000' }}>
      {/* Header - Fixed height */}
      <div ref={headerRef} className="pt-12 md:pt-20 pb-4 px-4 md:px-8 flex-shrink-0">
        <div className="text-right mb-4 md:mb-6">
          {/* Title with rectangles aligned to it */}
          <div className="flex items-center justify-end gap-3 mb-2">
            {/* Colored rectangles aligned with Features text */}
            <div className="flex items-center gap-2">
              <motion.div
                className="w-1 md:w-1.5 bg-yellow-500 rounded-[1px]"
                style={{ 
                  height: 'clamp(24px, 7vw, 64px)',
                  opacity: rect1Opacity,
                  scaleY: rect1Scale
                }}
              />
              <motion.div
                className="w-1.5 md:w-2 bg-orange-500 rounded-[1px]"
                style={{ 
                  height: 'clamp(24px, 7vw, 64px)',
                  opacity: rect2Opacity,
                  scaleY: rect2Scale
                }}
              />
              <motion.div
                className="w-2 md:w-3 bg-red-500 rounded-[1px]"
                style={{ 
                  height: 'clamp(24px, 7vw, 64px)',
                  opacity: rect3Opacity,
                  scaleY: rect3Scale
                }}
              />
            </div>
            
            {/* Join title */}
            <motion.h1 
              className={`text-6xl md:text-8xl lg:text-9xl font-bold ${huffer.className}`}
              style={{ 
                color: '#E2DFD6', 
                fontSize: 'clamp(24px, 7vw, 64px)',
                opacity: titleOpacity,
                y: titleY
              }}
            >
              Join
            </motion.h1>
          </div>
          
          {/* Subtitle separately */}
          <motion.p 
            className={`${deFonte.className} text-sm pr-4 md:pr-8`}
            style={{ 
              color: '#E2DFD6',
              opacity: subtitleOpacity,
              y: subtitleY
            }}
          >
            the better underground
          </motion.p>
        </div>
      </div>

      {/* Pinterest-style Gallery - Takes remaining space */}
      <div className="flex-1 px-4 md:px-8 pb-8 min-h-0">
        <PinterestGallery />
      </div>
    </div>
  )
}
