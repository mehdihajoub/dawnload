'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useVelocity } from 'framer-motion'
import localFont from 'next/font/local'

const moslin = localFont({
  src: '../public/Moslin.otf',
  display: 'swap',
  variable: '--font-moslin'
})

const deFonte = localFont({
  src: '../public/fonts/DeFontePlus-Leger/DeFontePlus-Leger.ttf',
  display: 'swap',
  variable: '--font-defonte'
})

const junicode = localFont({
  src: '../public/fonts/junicode/Junicode/Junicode.ttf',
  display: 'swap',
  variable: '--font-junicode'
})

const rectangleColors = [
  '#ED7B32'
]

const cardContent = [
  {
    title: "Creative Studio",
    text: [
      "We craft digital experiences",
      "that resonate with your audience.",
      "From concept to completion,",
      "we bring ideas to life."
    ]
  }
]

interface Rectangle {
  id: number
  color: string
}

export default function PinterestGallery() {
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [isFading, setIsFading] = useState(false)
  const [isCollapsing, setIsCollapsing] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [visibleLines, setVisibleLines] = useState(0)
  const [emailValue, setEmailValue] = useState('')
  const [hasMounted, setHasMounted] = useState(false)
  const [showJoinContent, setShowJoinContent] = useState(false)
  const [emailError, setEmailError] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState(false)

  const rectangles: Rectangle[] = rectangleColors.map((color, index) => ({
    id: index,
    color
  }))
  const hasRectangle0 = rectangles.some(r => r.id === 0)
  const hasRectangle1 = rectangles.some(r => r.id === 1)

  const fadeDurationMs = 280
  const collapseDurationMs = 500

  // Parallax effect for first rectangle
  const rectangle0Ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress: rect0Progress, scrollY } = useScroll({
    target: hasMounted && hasRectangle0 ? rectangle0Ref : undefined,
    offset: ['start 120%', 'start 30%']
  })
  
  // Physics-based movement for Join section content
  const scrollVelocity = useVelocity(scrollY)
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400
  })
  
  // Transform velocity into subtle movement
  const physicsX = useTransform(smoothVelocity, [-1000, 1000], [-15, 15])
  const physicsY = useTransform(smoothVelocity, [-1000, 1000], [-8, 8])
  const physicsRotate = useTransform(smoothVelocity, [-1000, 1000], [-1.5, 1.5])
  
  // Use fontSize transform for crisp text at all sizes
  const textFontSize = useTransform(rect0Progress, [0, 1], ['480px', '42px'])

  // Parallax effect for second rectangle
  const rectangle1Ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress: rect1Progress } = useScroll({
    target: hasMounted && hasRectangle1 ? rectangle1Ref : undefined,
    offset: ['start 120%', 'start 30%']
  })
  useEffect(() => {
    setHasMounted(true)
  }, [])

  // Detect when rectangle enters center of viewport
  useEffect(() => {
    const el = rectangle0Ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShowJoinContent(true)
          }
        })
      },
      {
        threshold: 0.5, // Trigger when 50% of element is visible (center of viewport)
        rootMargin: '-20% 0px -20% 0px' // Adjust to center detection
      }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  
  // Use fontSize transform for crisp text at all sizes
  const textFontSize1 = useTransform(rect1Progress, [0, 1], ['480px', '42px'])

  // Handle text animation when card expands
  useEffect(() => {
    if (expandedId !== null) {
      // Wait for card to reach final size, then show content
      const showContentDelay = collapseDurationMs + 200 // Card animation + small delay
      const showContentTimer = setTimeout(() => {
        setShowContent(true)
        setVisibleLines(0)
        
        // Animate lines one by one
        const textLines = cardContent[expandedId].text
        textLines.forEach((_, index) => {
          setTimeout(() => {
            setVisibleLines(index + 1)
          }, (index + 1) * 300) // 300ms between each line
        })
      }, showContentDelay)

      return () => clearTimeout(showContentTimer)
    } else {
      setShowContent(false)
      setVisibleLines(0)
    }
  }, [expandedId])


  const handleClose = () => {
    if (expandedId === null || isCollapsing) return
    // Prepare grid target: keep selected id around during collapse
    setPendingId(expandedId)
    setIsCollapsing(true)
    // Trigger shared layout collapse by unmounting overlay immediately
    setExpandedId(null)
    // After collapse completes, reveal other tiles
    setTimeout(() => {
      setIsCollapsing(false)
      setPendingId(null)
    }, collapseDurationMs)
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleJoinClick = () => {
    setEmailError(false)
    setEmailSuccess(false)
    
    if (validateEmail(emailValue)) {
      // Valid email - show success animation
      setEmailSuccess(true)
      // Here you can add your API call to register the email
      console.log('Email registered:', emailValue)
      
      // Reset after animation
      setTimeout(() => {
        setEmailValue('')
        setEmailSuccess(false)
      }, 3000)
    } else {
      // Invalid email - show error
      setEmailError(true)
      setTimeout(() => {
        setEmailError(false)
      }, 3000)
    }
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Grid container */}
      <div className="relative w-full max-w-4xl">
        {/* Grid layout - 1 column vertical stack */}
        <div className="grid grid-cols-1 gap-6 auto-rows-fr">
          {rectangles.map((rectangle) => {
            const isSelected = pendingId === rectangle.id || expandedId === rectangle.id
            // Opacity rules:
            // - Expanded: hide grid (all 0)
            // - Collapsing: show only selected (1), keep others hidden (0)
            // - Fading (opening): non-selected -> 0, selected -> 1
            // - Idle: all 1
            const opacity = expandedId !== null
              ? 0
              : isCollapsing
                ? (isSelected ? 1 : 0)
                : isFading
                  ? (isSelected ? 1 : 0)
                  : 1

            return (
              <motion.div
                key={rectangle.id}
                ref={rectangle.id === 0 ? rectangle0Ref : rectangle.id === 1 ? rectangle1Ref : null}
                className="relative overflow-hidden"
                layout
                layoutId={`rectangle-${rectangle.id}`}
                initial={false}
                animate={{ opacity }}
                transition={{
                  opacity: { duration: fadeDurationMs / 1000, ease: 'easeOut' },
                  layout: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
                }}
                style={{
                  backgroundImage: 'url(/assets/images/bgjoin.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  aspectRatio: '3/4',
                  borderRadius: '12px',
                  // Hide the selected tile only once expansion begins to prevent duplication
                  visibility: expandedId === rectangle.id ? 'hidden' : 'visible'
                }}
              >
                {/* Text for first rectangle */}
                {rectangle.id === 0 && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: showJoinContent ? 0.5 : 0, y: showJoinContent ? 0 : 20 }}
                      transition={{ duration: 0.6, ease: 'easeOut', delay: 0 }}
                      className={moslin.className}
                      style={{
                        fontWeight: 700,
                        fontSize: '42px',
                        color: '#FFF',
                        position: 'absolute',
                        top: '1.5rem',
                        left: '1.5rem',
                        right: '1.5rem',
                        transformOrigin: 'top left',
                        lineHeight: 1.4,
                        textShadow: '0 0 2px rgba(255, 255, 255, 0.2), 0 0 5px rgba(255, 255, 255, 0.4)',
                        x: physicsX,
                        y: physicsY,
                        rotate: physicsRotate
                      }}
                    >
                      studuo
                    </motion.h2>

                    {/* Description text below studuo */}
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: showJoinContent ? 0.7 : 0, y: showJoinContent ? 0 : 20 }}
                      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
                      className={junicode.className}
                      style={{
                        fontSize: 'clamp(14px, 3vw, 20px)',
                        color: '#FFF',
                        position: 'absolute',
                        top: 'calc(1.5rem + 42px + 0.5rem)',
                        left: '1.5rem',
                        right: '1.5rem',
                        lineHeight: 1.6,
                        paddingTop: '1rem',
                        paddingBottom: '1rem',
                        textShadow: '0 0 5px rgba(255, 255, 255, 0.6), 0 0 10px rgba(255, 255, 255, 0.4)',
                        x: physicsX,
                        y: physicsY
                      }}
                    >
                      Seeking out exceptional design and art helps us improve our skills and stay up-to-date.
                      Sometimes, the best ideas come from stepping. 
                    </motion.p>
                    
                    {/* Email input section */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center',
                        width: '80%',
                        marginTop: '3rem'
                      }}
                    >
                      
                      {/* Email input and join button */}
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: '1rem', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        width: '100%', 
                        maxWidth: '400px',
                        pointerEvents: 'auto', 
                        zIndex: 10 
                      }}>
                        <motion.input
                          initial={{ opacity: 0, y: 20 }}
                          animate={{
                            opacity: showJoinContent ? 1 : 0,
                            y: showJoinContent ? 0 : 20,
                            scale: emailError ? [1, 1.02, 1] : 1,
                            borderColor: emailError ? '#FF0000' : 'rgba(207, 213, 201, 0.3)'
                          }}
                          transition={{
                            opacity: { duration: 0.6, ease: 'easeOut', delay: 0.6 },
                            y: { duration: 0.6, ease: 'easeOut', delay: 0.6 },
                            scale: { duration: 0.3 },
                            borderColor: { duration: 0.3 }
                          }}
                          type="email"
                          placeholder="Enter your email"
                          value={emailValue}
                          onChange={(e) => setEmailValue(e.target.value)}
                          className={deFonte.className}
                          style={{
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            border: '1px solid rgba(207, 213, 201, 0.3)',
                            backgroundColor: '#CFD5C9',
                            color: '#000000',
                            fontSize: '14px',
                            width: '100%',
                            pointerEvents: 'auto',
                            zIndex: 10,
                            x: physicsX,
                            y: physicsY
                          }}
                        />
                        <motion.button
                          initial={{ opacity: 0, y: 20 }}
                          className={deFonte.className}
                          onClick={handleJoinClick}
                          animate={{
                            opacity: showJoinContent ? 1 : 0,
                            y: showJoinContent ? 0 : 20,
                            scale: emailSuccess ? [1, 1.1, 1] : 1,
                            backgroundColor: emailSuccess ? '#4CAF50' : '#FF5B04'
                          }}
                          transition={{ 
                            opacity: { duration: 0.6, ease: 'easeOut', delay: 0.9 },
                            y: { duration: 0.6, ease: 'easeOut', delay: 0.9 },
                            scale: { duration: 0.5 },
                            backgroundColor: { duration: 0.5 }
                          }}
                          style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#FF5B04',
                            color: '#000000',
                            fontSize: '14px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            whiteSpace: 'nowrap',
                            pointerEvents: 'auto',
                            zIndex: 10,
                            x: physicsX,
                            y: physicsY,
                            rotate: physicsRotate
                          }}
                          onMouseEnter={(e) => {
                            if (!emailSuccess) {
                              e.currentTarget.style.backgroundColor = '#ED7B32'
                              e.currentTarget.style.transform = 'scale(1.02)'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!emailSuccess) {
                              e.currentTarget.style.backgroundColor = '#FF5B04'
                              e.currentTarget.style.transform = 'scale(1)'
                            }
                          }}
                        >
                          {emailSuccess ? '✓ Registered!' : 'join the movement'}
                        </motion.button>
                        
                        {/* Error message */}
                        <AnimatePresence>
                          {emailError && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.3 }}
                              className={deFonte.className}
                              style={{
                                color: '#FF6B6B',
                                fontSize: '14px',
                                marginTop: '0.5rem',
                                textAlign: 'center'
                              }}
                            >
                              input a valid email pliz :'(
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Join the movement text at bottom */}
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: showJoinContent ? 0.9 : 0, y: showJoinContent ? 0 : 20 }}
                      transition={{ duration: 0.6, ease: 'easeOut', delay: 1.2 }}
                      className={deFonte.className}
                      style={{
                        position: 'absolute',
                        bottom: '1.5rem',
                        left: '1.5rem',
                        right: '1.5rem',
                        textAlign: 'center',
                        fontSize: 'clamp(14px, 3vw, 18px)',
                        color: '#D1AA81',
                        fontWeight: 300,
                        x: physicsX,
                        y: physicsY
                      }}
                    >
                      the better underground
                    </motion.p>
                    
                  </div>
                )}
                
                {/* Parallax text and mockup for second rectangle */}
                {rectangle.id === 1 && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.h2
                      style={{
                        fontFamily: 'AeonikPro, sans-serif',
                        fontWeight: 700,
                        fontSize: textFontSize1,
                        color: '#FFF',
                        position: 'absolute',
                        top: '1.5rem',
                        left: '1.5rem',
                        right: '1.5rem',
                        transformOrigin: 'top left',
                        lineHeight: 1
                      }}
                    >
                      Monetize your talent
                    </motion.h2>
                    
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Expanded rectangle - centered within grid container */}
        <AnimatePresence>
          {expandedId !== null && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                layoutId={`rectangle-${expandedId}`}
                className="relative overflow-hidden"
                style={{
                  backgroundColor: rectangleColors[expandedId],
                  borderRadius: '12px',
                  width: '90%', // 90% of grid container width
                  maxWidth: '800px',
                  aspectRatio: '3/4', // Taller aspect ratio
                }}
                transition={{ duration: collapseDurationMs / 1000, ease: [0.4, 0, 0.2, 1] }}
              >
                {/* Content overlay */}
                <AnimatePresence>
                  {showContent && expandedId !== null && (
                    <motion.div
                      className="absolute inset-0 flex flex-col justify-start items-start p-8 text-white"
                      style={{ 
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 40%, transparent 70%)',
                        paddingTop: '5rem'
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Title */}
                      <motion.h2
                        className="text-4xl md:text-5xl font-bold mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.4 }}
                      >
                        {cardContent[expandedId].title}
                      </motion.h2>
                      
                      {/* Text lines */}
                      <div className="space-y-2">
                        {cardContent[expandedId].text.map((line, index) => (
                          <motion.p
                            key={index}
                            className="text-lg md:text-xl opacity-0"
                            animate={{ 
                              opacity: index < visibleLines ? 1 : 0,
                              y: index < visibleLines ? 0 : 10
                            }}
                            transition={{ 
                              duration: 0.4,
                              ease: "easeOut"
                            }}
                          >
                            {line}
                          </motion.p>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Close button */}
                <motion.button
                  className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
                  onClick={handleClose}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ delay: 0.25, duration: 0.15 }}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={rectangleColors[expandedId]}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
