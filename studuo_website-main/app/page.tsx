"use client"

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useSpring, useVelocity, useTransform, useMotionValue, animate } from 'framer-motion'
import CardHolder from '@/components/CardHolder'
import ScrollFeatureShowcase from '@/components/ScrollFeatureShowcase'
import { Staatliches, Inter } from 'next/font/google'
import localFont from 'next/font/local'

const bauhaus = Staatliches({ subsets: ['latin'], weight: '400' })
const modern = Inter({ subsets: ['latin'], weight: ['400', '700'] })
const geometric = localFont({
  src: '../public/fonts/Botch.otf',
  display: 'swap',
  variable: '--font-botch'
})
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

export default function Home() {
  const [isScrollingDown, setIsScrollingDown] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [showLoadingScreen, setShowLoadingScreen] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<'home' | 'features'>('home')
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [formStep, setFormStep] = useState(1)
  
  // Rotating word animation
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [wordFadeOut, setWordFadeOut] = useState(false)
  
  const rotatingWords = [
    'Studio',
    'Beatmaker',
    'Producer',
    'Sound engineer',
    'Mixing engineer',
    'Mastering engineer',
    'Home studio',
    'Guitarist',
    'Bassist',
    'Drummer',
    'Pianist',
    'Songwriter',
    'Lyricist',
    'Topliner',
    'DJ',
    'Remixer',
    'Sound designer',
    'Sample maker',
    'Loop creator',
    'Vocal coach',
    'Performance coach',
    'Music teacher',
    'Music student',
    'Video director',
    'Photographer',
    'Videographer',
    'Graphic designer',
    'Cover artist',
    'Animator',
    'Manager',
    'Label owner'
  ]
  
  // Robustly lock scroll when menu is open and restore on close
  useEffect(() => {
    const html = document.documentElement
    if (isMenuOpen) {
      const scrollY = window.scrollY
      const originalHtmlOverflow = html.style.overflow
      const originalBodyOverflow = document.body.style.overflow
      const originalBodyPosition = document.body.style.position
      const originalBodyTop = document.body.style.top
      const originalBodyWidth = document.body.style.width

      html.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'

      const preventScroll = (e: Event) => e.preventDefault()
      const preventKeys = (e: KeyboardEvent) => {
        const blockedKeys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ']
        if (blockedKeys.includes(e.key)) e.preventDefault()
      }

      window.addEventListener('wheel', preventScroll, { passive: false })
      window.addEventListener('touchmove', preventScroll, { passive: false })
      window.addEventListener('keydown', preventKeys)

      return () => {
        window.removeEventListener('wheel', preventScroll as EventListener)
        window.removeEventListener('touchmove', preventScroll as EventListener)
        window.removeEventListener('keydown', preventKeys as EventListener)
        html.style.overflow = originalHtmlOverflow
        document.body.style.overflow = originalBodyOverflow
        document.body.style.position = originalBodyPosition
        const top = document.body.style.top
        document.body.style.top = originalBodyTop
        document.body.style.width = originalBodyWidth
        const y = top ? parseInt(top) : 0
        window.scrollTo(0, Math.abs(y) || scrollY)
      }
    }
  }, [isMenuOpen])
  const [selectedFeature, setSelectedFeature] = useState<number | null>(1)
  const lastYRef = useRef<number>(0)
  // Subtle physics movement
  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)
  const inertial = useSpring(scrollVelocity, { stiffness: 50, damping: 20, mass: 0.3 })

  // Home section with parallax for home image
  const homeSectionRef = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress: homeProgress } = useScroll({ target: homeSectionRef, offset: ['start start', 'end start'] })
  const homeParallaxY = useTransform(homeProgress, [0, 1], ['0%', '-120%'])
  
  // Control bottom text visibility based on scroll - appears when bottom of section reaches middle of viewport
  const { scrollYProgress: bottomTextProgress } = useScroll({ 
    target: homeSectionRef, 
    offset: ['end end', 'end center'] 
  })
  const textOpacity = useTransform(bottomTextProgress, [0, 1], [0, 1])
  const textY = useTransform(bottomTextProgress, [0, 1], [20, 0])
  
  const homeX = useTransform(inertial, (v) => {
    const gain = 0.015
    const max = 4
    const val = v * gain
    return Math.max(Math.min(val, max), -max)
  })
  const homeRotate = useTransform(inertial, (v) => {
    const gain = 0.0003
    const max = 0.4
    const val = v * gain
    return Math.max(Math.min(val, max), -max)
  })

  const phoneImgRef = useRef<HTMLImageElement | null>(null)
  const phoneScale = useTransform(homeProgress, [0, 1], [1.15, 1.8])

  // Parallax for About section image
  const aboutSectionRef = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress: aboutProgress } = useScroll({ target: aboutSectionRef, offset: ['start end', 'end start'] })
  const aboutParallaxY = useTransform(aboutProgress, [0, 1], ['-6%', '6%'])
  const aboutX = useTransform(inertial, (v) => {
    const gain = 0.02
    const max = 6
    const val = v * gain
    return Math.max(Math.min(val, max), -max)
  })
  const aboutRotate = useTransform(inertial, (v) => {
    const gain = 0.0004
    const max = 0.6
    const val = v * gain
    return Math.max(Math.min(val, max), -max)
  })

  // Handle loading screen animation
  useEffect(() => {
    // Loading screen: logo appears, stays for 1s, then disappears
    const hideLoadingTimer = setTimeout(() => {
      setShowLoadingScreen(false)
    }, 2000) // Logo appears at 0s, stays visible until 2s (1s visible + 1s transition)

    return () => {
      clearTimeout(hideLoadingTimer)
    }
  }, [])

  // Handle initial load animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false)
    }, 3000) // Animation duration

    return () => clearTimeout(timer)
  }, [])

  // Handle rotating word animation
  useEffect(() => {
    if (showLoadingScreen) return // Don't start until loading screen is done
    
    const interval = setInterval(() => {
      // Fade out
      setWordFadeOut(true)
      
      // After fade out, change word and fade in
      setTimeout(() => {
        setCurrentWordIndex((prev) => (prev + 1) % rotatingWords.length)
        setWordFadeOut(false)
      }, 400) // Half of the transition duration for smooth swap
    }, 3500) // Change word every 3.5 seconds
    
    return () => clearInterval(interval)
  }, [showLoadingScreen, rotatingWords.length])

  useEffect(() => {
    lastYRef.current = window.scrollY
    const threshold = 2
    const onScroll = () => {
      const y = window.scrollY
      
      // Show navbar once user starts scrolling
      if (y > 10 && !hasScrolled) {
        setHasScrolled(true)
      }
      
      const delta = y - lastYRef.current
      if (delta > threshold) {
        setIsScrollingDown(true)
      } else if (delta < -threshold) {
        setIsScrollingDown(false)
      }
      lastYRef.current = y

      // Update active section based on scroll position
      const homeSection = document.getElementById('home')
      const featuresSection = document.getElementById('features')

      const homeHeight = homeSection?.offsetHeight ?? 0

      if (y < homeHeight - 1) {
        setActiveSection('home')
      } else {
        setActiveSection('features')
      }

    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [hasScrolled])

  // Ensure we start at the Home section on initial load
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    // Jump to top/home immediately without animation
    const home = document.getElementById('home')
    if (home) {
      home.scrollIntoView({ behavior: 'auto', block: 'start' })
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }
  }, [])

  // Adapt background color (body and theme-color) based on active section
  useEffect(() => {
    const sectionBg: Record<typeof activeSection, string> = {
      home: '#000000',
      features: '#000000',
    }
    const newColor = sectionBg[activeSection]

    // Update document body background
    document.body.style.backgroundColor = newColor

    // Update meta theme-color for mobile status bar
    let meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'theme-color'
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', newColor)
  }, [activeSection])

  const handleNavClick = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
  return (
    <main className="min-h-screen relative" style={{ backgroundColor: '#000000' }}>

      {/* Upper navbar - Fixed and always on top */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-[9999] pt-safe-area-inset-top pointer-events-none" 
        style={{ backgroundColor: '#000000' }}
      >
        <div className="flex justify-between items-center py-4 px-6 pointer-events-auto">
            {/* Logo on the left */}
            <motion.div 
              className={`${moslin.className} font-bold flex items-center`}
            style={{ color: '#E2DFD6' }}
            >
              <span className="text-2xl">∑</span>
            </motion.div>
            
            {/* Menu toggle button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="hover:opacity-70 transition-opacity flex flex-col gap-1 justify-center items-center w-8 h-8 relative"
            >
              <motion.div 
                className="w-6 h-0.5 absolute"
              style={{ backgroundColor: '#E2DFD6' }}
                animate={{
                  rotate: isMenuOpen ? 45 : 0,
                y: isMenuOpen ? 0 : -2.5
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              />
              <motion.div 
                className="w-6 h-0.5 absolute"
              style={{ backgroundColor: '#E2DFD6' }}
                animate={{
                  rotate: isMenuOpen ? -45 : 0,
                y: isMenuOpen ? 0 : 2.5
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              />
            </button>
          </div>
      </motion.nav>

      {/* Sections */}
      <motion.section 
        id="home" 
        ref={homeSectionRef} 
        className="relative min-h-[140svh] flex items-center justify-center px-6 overflow-visible" 
        style={{ backgroundColor: '#000000' }}
        animate={{
          filter: isMenuOpen ? 'blur(20px)' : 'blur(0px)'
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >

        {/* Text above phone mockup */}
        <div 
          className="absolute left-0 right-0 z-40"
          style={{ 
            top: 'calc(env(safe-area-inset-top, 0px) + 100px)',
            paddingLeft: 'clamp(3rem, 8vw, 8rem)',
            paddingRight: 'clamp(1.5rem, 4vw, 4rem)'
          }}
        >
          <motion.div
            className={`${deFonte.className} flex flex-col gap-2`}
            initial="hidden"
            animate={showLoadingScreen ? "hidden" : "show"}
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.3,
                  delayChildren: 0.2
                }
              }
            }}
          >
            <motion.p 
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
              }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{ 
                color: '#CFD5C9',
                fontSize: 'clamp(34px, 7vw, 60px)',
                lineHeight: '1.2'
              }}
            >
              Find a{' '}
              <motion.span
                key={currentWordIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: wordFadeOut ? 0 : 1 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                style={{ display: 'inline-block' }}
              >
                {rotatingWords[currentWordIndex]}
              </motion.span>
            </motion.p>
            <motion.p 
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
              }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{ 
                color: '#CFD5C9',
                fontSize: 'clamp(34px, 7vw, 60px)',
                lineHeight: '1.2'
              }}
            >
              Get discovered
            </motion.p>
            <motion.p 
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
              }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{ 
                color: '#CFD5C9',
                fontSize: 'clamp(34px, 7vw, 60px)',
                lineHeight: '1.2'
              }}
            >
              Be the first to join
            </motion.p>
            <motion.div 
              className="flex items-center gap-3 mt-4"
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
              }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <input
                type="email"
                placeholder="Your email"
                className="px-4 py-3 rounded-full pointer-events-auto flex-1 max-w-md"
                style={{
                  backgroundColor: 'transparent',
                  border: '2px solid #CFD5C9',
                  color: '#CFD5C9',
                  fontSize: 'clamp(14px, 2.5vw, 18px)',
                  outline: 'none'
                }}
              />
              <button
                className="px-6 py-3 rounded-full transition-opacity hover:opacity-70 pointer-events-auto"
                style={{
                  backgroundColor: '#CFD5C9',
                  color: '#000000',
                  fontSize: 'clamp(14px, 2.5vw, 18px)',
                  fontWeight: '500'
                }}
              >
                join
              </button>
            </motion.div>
          </motion.div>
        </div>

        {/* Centered iPhone mockup */}
        <motion.div 
          className="pointer-events-none absolute left-0 right-0 flex flex-col items-center justify-start z-[100]"
          style={{ 
            top: '40%',
            y: homeParallaxY
          }}
          initial={{ y: '100vh' }}
          animate={{ y: showLoadingScreen ? '100vh' : 0 }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: showLoadingScreen ? 0 : 0.8 }}
        >
          <div
            style={{
              paddingLeft: 'clamp(1.5rem, 4vw, 4rem)',
              paddingRight: 'clamp(1.5rem, 4vw, 4rem)',
            }}
          >
            <motion.img
              src="/assets/mockup/4.png"
              alt="iPhone mockup"
              className="w-full max-w-[min(70vw,420px)] h-auto object-contain drop-shadow-[0_24px_48px_rgba(0,0,0,0.35)]"
              ref={phoneImgRef}
              style={{ rotate: homeRotate, scale: phoneScale }}
            />
          </div>
          
          {/* Growing title below iPhone */}
          <motion.div
            className="w-full flex justify-center"
            style={{
              marginTop: useTransform(homeProgress, [0, 1], ['4rem', '12rem']),
              paddingTop: 'clamp(0.25rem, 0.5vw, 0.5rem)',
              paddingBottom: 'clamp(1rem, 2.5vw, 2rem)'
            }}
          >
            <motion.div
              style={{
                transformOrigin: 'center top',
                fontFamily: 'AeonikPro, sans-serif',
                fontWeight: 700,
                color: '#CFD5C9',
                fontSize: useTransform(homeProgress, [0, 1], ['8px', '200px']),
                lineHeight: 1.1,
                maxWidth: '95vw',
                textAlign: 'center'
              }}
            >
                <motion.div
                  style={{
                    opacity: useTransform(homeProgress, [0, 0.15], [0, 1])
                  }}
                >
                  No More
                </motion.div>
                <motion.div
                  style={{
                    opacity: useTransform(homeProgress, [0.2, 0.35], [0, 1])
                  }}
                >
                  Expensive
                </motion.div>
                <motion.div
                  style={{
                    opacity: useTransform(homeProgress, [0.35, 0.5], [0, 1])
                  }}
                >
                  Sessions
                </motion.div>
                <motion.div
                  style={{
                    opacity: useTransform(homeProgress, [0.4, 0.55], [0, 1])
                  }}
                >
                  with
                </motion.div>
                <motion.div
                  className={moslin.className}
                  style={{
                    opacity: useTransform(homeProgress, [0.45, 0.6], [0, 1]),
                    fontSize: '0.4em'
                  }}
                >
                  studuo
                </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Scroll-driven Feature Showcase (fixed canvas) */}
      <motion.section 
        id="showcase"
        className="relative bg-[#000000]"
        animate={{
          filter: isMenuOpen ? 'blur(20px)' : 'blur(0px)'
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <ScrollFeatureShowcase />
      </motion.section>

      {/* Features */}
      <motion.section 
        id="features" 
        className="relative bg-[#000000]"
        style={{ minHeight: 'auto' }}
        animate={{
          filter: isMenuOpen ? 'blur(20px)' : 'blur(0px)'
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <CardHolder />
      </motion.section>

      {/* Locations */}
      <motion.section 
        id="locations" 
        className="relative min-h-[100svh] bg-[#000000] px-6 overflow-visible"
        animate={{
          filter: isMenuOpen ? 'blur(20px)' : 'blur(0px)'
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <h1
          className="pt-[calc(env(safe-area-inset-top,0px)+20px)] text-[clamp(24px,6vw,48px)]"
          style={{ color: '#E2DFD6', fontFamily: 'AeonikPro', fontWeight: 700, fontStyle: 'normal' }}
        >
          our studuos are in
        </h1>
        <motion.div 
          className="mt-6 md:mt-8 w-full flex justify-center relative pr-12"
          initial={{ opacity: 0, y: 50, scaleY: 1 }}
          whileInView={{ opacity: 1, y: 0, scaleY: 1.05 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ transformOrigin: 'bottom' }}
        >
          <img
            src="/assets/images/zurich.jpg"
            alt="Zurich city view"
            className="w-full max-w-2xl object-cover"
            style={{ aspectRatio: '16 / 10', borderRadius: '3rem' }}
          />
          <div className="absolute right-4" style={{ bottom: '-40%' }}>
            <img
              src="/assets/images/zurich_night.jpg"
              alt="Zurich night view"
              className="h-32 w-28 object-cover rounded-xl"
            />
          </div>
        </motion.div>
        <motion.p 
          className={`mt-4 mb-[-1rem] text-left pl-6 md:pl-[calc((100%-48rem)/2)] ${moslin.className}`}
          style={{ 
            color: '#CFD5C9',
            fontSize: 'clamp(28px, 4vw, 36px)'
          }}
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
        >
          Zürich
        </motion.p>

        {/* Second image layout - overlay on left */}
        <motion.div 
          className="mt-24 md:mt-28 w-full flex justify-center relative pl-12"
          initial={{ opacity: 0, y: 50, scaleY: 1 }}
          whileInView={{ opacity: 1, y: 0, scaleY: 1.05 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ transformOrigin: 'bottom' }}
        >
          <img
            src="/assets/images/geneva.jpg"
            alt="Zurich city view"
            className="w-full max-w-2xl object-cover"
            style={{ aspectRatio: '16 / 10', borderRadius: '3rem' }}
          />
          <div className="absolute left-4" style={{ bottom: '-40%' }}>
            <img
              src="/assets/images/geneva_night.jpg"
              alt="Zurich night view"
              className="h-32 w-28 object-cover rounded-xl"
            />
          </div>
        </motion.div>
        <motion.p 
          className={`mt-4 mb-[-1rem] text-right pr-6 md:pr-[calc((100%-48rem)/2)] ${moslin.className}`}
          style={{ 
            color: '#CFD5C9',
            fontSize: 'clamp(24px, 3.5vw, 32px)'
          }}
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
        >
          Geneva
        </motion.p>

        {/* Third image layout - overlay on right */}
        <motion.div 
          className="mt-24 md:mt-28 w-full flex justify-center relative pr-12"
          initial={{ opacity: 0, y: 50, scaleY: 1 }}
          whileInView={{ opacity: 1, y: 0, scaleY: 1.1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ transformOrigin: 'bottom' }}
        >
          <img
            src="/assets/images/lausanne.jpg"
            alt="Zurich city view"
            className="w-full max-w-2xl object-cover"
            style={{ aspectRatio: '16 / 10', borderRadius: '3rem' }}
          />
          <div className="absolute right-4" style={{ bottom: '-40%' }}>
            <img
              src="/assets/images/zurich_night.jpg"
              alt="Zurich night view"
              className="h-32 w-28 object-cover rounded-xl"
            />
          </div>
        </motion.div>
        <motion.p 
          className={`mt-1 mb-[-1rem] text-left pl-6 md:pl-[calc((100%-48rem)/2)] ${moslin.className}`}
          style={{ 
            color: '#CFD5C9',
            fontSize: 'clamp(18px, 2.5vw, 24px)'
          }}
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
        >
          Lausanne
        </motion.p>
        <div className="pb-16"></div>
      </motion.section>

      {/* About */}
      <motion.section 
        id="about" 
        ref={aboutSectionRef}
        className="relative min-h-[100svh] bg-[#000000] px-6 overflow-visible"
        animate={{
          filter: isMenuOpen ? 'blur(20px)' : 'blur(0px)'
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div 
          className={`absolute left-6 top-1/2 transform -translate-y-1/2 ${moslin.className}`}
          style={{
            color: '#CFD5C9',
            fontSize: 'clamp(48px, 8vw, 96px)',
            writingMode: 'vertical-rl',
            textOrientation: 'mixed'
          }}
        >
          STUDUO
        </div>

        {/* Lorem Ipsum Text */}
        <div className="relative z-10 flex items-center justify-center min-h-[100svh] pt-[calc(env(safe-area-inset-top,0px)+88px)] pb-16">
          <div className="max-w-3xl mx-auto px-4">
            <p 
              style={{
                fontFamily: '"Times New Roman", Times, serif',
                fontSize: 'clamp(16px, 2.5vw, 20px)',
                color: '#E2DFD6',
                lineHeight: '1.8',
                textAlign: 'justify',
                opacity: 0.6
              }}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              <br /><br />
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
              <br /><br />
              Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur.
            </p>
          </div>
        </div>

        {/* Centered iPhone mockup with parallax/physics movement */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-50">
          <motion.img
            src="/assets/mockup/2.png"
            alt="Studuo mockup"
            className="w-[220px] md:w-[300px] h-auto object-contain drop-shadow-[0_-18px_36px_rgba(0,0,0,0.35)]"
            style={{ transform: 'scale(0.7)', y: aboutParallaxY, x: aboutX, rotate: aboutRotate }}
          />
        </div>
      </motion.section>

      {/* Contact - Studio Registration */}
      <motion.section 
        id="contact" 
        className="relative min-h-[100svh] bg-[#000000] px-6 overflow-visible flex items-center justify-center"
        animate={{
          filter: isMenuOpen ? 'blur(20px)' : 'blur(0px)'
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="w-full max-w-4xl mx-auto pt-[calc(env(safe-area-inset-top,0px)+88px)] pb-16">
          {!showRegistrationForm ? (
            // Initial CTA View
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="text-center"
            >
              <h2 
                className={`${moslin.className} mb-6`}
                style={{ 
                  color: '#E2DFD6',
                  fontSize: 'clamp(32px, 6vw, 56px)',
                  lineHeight: 1.2
                }}
              >
                Register your studio
              </h2>
              <p
                className="mb-12"
                style={{
                  fontFamily: 'AeonikPro, sans-serif',
                  fontWeight: 300,
                  fontSize: 'clamp(16px, 2vw, 20px)',
                  color: '#CFD5C9',
                  opacity: 0.7,
                  maxWidth: '600px',
                  margin: '0 auto 3rem'
                }}
              >
                Join the better underground. Partner with Studuo and connect with artists looking for quality studio time.
              </p>
              <motion.button
                onClick={() => {
                  setShowRegistrationForm(true)
                  setFormStep(1)
                }}
                className="px-12 py-4 rounded-lg font-bold text-lg"
                style={{
                  backgroundColor: '#FF5B04',
                  color: '#000000',
                  fontFamily: 'AeonikPro, sans-serif',
                  border: 'none',
                  cursor: 'pointer'
                }}
                whileHover={{ scale: 1.05, backgroundColor: '#ED7B32' }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
              </motion.button>
            </motion.div>
          ) : (
            // Multi-step Form
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {/* Progress Indicator */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-center flex-1">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all"
                        style={{
                          backgroundColor: formStep >= step ? '#FF5B04' : 'transparent',
                          border: `2px solid ${formStep >= step ? '#FF5B04' : '#E2DFD6'}`,
                          color: formStep >= step ? '#000000' : '#E2DFD6',
                          fontFamily: 'AeonikPro, sans-serif'
                        }}
                      >
                        {step}
                      </div>
                      {step < 3 && (
                        <div
                          className="flex-1 h-0.5 mx-2"
                          style={{
                            backgroundColor: formStep > step ? '#FF5B04' : '#E2DFD6',
                            opacity: formStep > step ? 1 : 0.3
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <p
                  style={{
                    fontFamily: 'AeonikPro, sans-serif',
                    fontSize: '14px',
                    color: '#CFD5C9',
                    opacity: 0.6,
                    textAlign: 'center'
                  }}
                >
                  Step {formStep} of 3
                </p>
              </div>

              {/* Form Steps */}
              <motion.form
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (formStep < 3) {
                    setFormStep(formStep + 1)
                  } else {
                    const formData = new FormData(e.currentTarget)
                    const data = Object.fromEntries(formData.entries())
                    console.log('Form submitted:', data)
                    // TODO: Send to backend
                    alert('Thank you! We\'ll get back to you soon.')
                    setShowRegistrationForm(false)
                    setFormStep(1)
                    e.currentTarget.reset()
                  }
                }}
              >
                {/* Step 1: Basic Info */}
                {formStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <h3
                      style={{
                        fontFamily: 'AeonikPro, sans-serif',
                        fontWeight: 700,
                        fontSize: 'clamp(20px, 3vw, 28px)',
                        color: '#E2DFD6',
                        marginBottom: '1.5rem'
                      }}
                    >
                      Basic Information
                    </h3>

                    {/* Studio Name */}
                    <div>
                      <label 
                        htmlFor="studioName"
                        style={{
                          fontFamily: 'AeonikPro, sans-serif',
                          fontWeight: 700,
                          fontSize: '14px',
                          color: '#E2DFD6',
                          display: 'block',
                          marginBottom: '0.5rem'
                        }}
                      >
                        Studio Name *
                      </label>
                      <input
                        type="text"
                        id="studioName"
                        name="studioName"
                        required
                        className="w-full px-4 py-3 bg-transparent border-2 rounded-lg focus:outline-none focus:border-[#FF5B04] transition-colors"
                        style={{
                          borderColor: '#E2DFD6',
                          color: '#E2DFD6',
                          fontFamily: 'AeonikPro, sans-serif',
                          fontSize: '16px'
                        }}
                        placeholder="Enter your studio name"
                      />
                    </div>

                    {/* Contact Person */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label 
                          htmlFor="firstName"
                          style={{
                            fontFamily: 'AeonikPro, sans-serif',
                            fontWeight: 700,
                            fontSize: '14px',
                            color: '#E2DFD6',
                            display: 'block',
                            marginBottom: '0.5rem'
                          }}
                        >
                          First Name *
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          required
                          className="w-full px-4 py-3 bg-transparent border-2 rounded-lg focus:outline-none focus:border-[#FF5B04] transition-colors"
                          style={{
                            borderColor: '#E2DFD6',
                            color: '#E2DFD6',
                            fontFamily: 'AeonikPro, sans-serif',
                            fontSize: '16px'
                          }}
                          placeholder="Your first name"
                        />
                      </div>

                      <div>
                        <label 
                          htmlFor="lastName"
                          style={{
                            fontFamily: 'AeonikPro, sans-serif',
                            fontWeight: 700,
                            fontSize: '14px',
                            color: '#E2DFD6',
                            display: 'block',
                            marginBottom: '0.5rem'
                          }}
                        >
                          Last Name *
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          required
                          className="w-full px-4 py-3 bg-transparent border-2 rounded-lg focus:outline-none focus:border-[#FF5B04] transition-colors"
                          style={{
                            borderColor: '#E2DFD6',
                            color: '#E2DFD6',
                            fontFamily: 'AeonikPro, sans-serif',
                            fontSize: '16px'
                          }}
                          placeholder="Your last name"
                        />
                      </div>
                    </div>

                    {/* Email & Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label 
                          htmlFor="email"
                          style={{
                            fontFamily: 'AeonikPro, sans-serif',
                            fontWeight: 700,
                            fontSize: '14px',
                            color: '#E2DFD6',
                            display: 'block',
                            marginBottom: '0.5rem'
                          }}
                        >
                          Email *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          className="w-full px-4 py-3 bg-transparent border-2 rounded-lg focus:outline-none focus:border-[#FF5B04] transition-colors"
                          style={{
                            borderColor: '#E2DFD6',
                            color: '#E2DFD6',
                            fontFamily: 'AeonikPro, sans-serif',
                            fontSize: '16px'
                          }}
                          placeholder="your@email.com"
                        />
                      </div>

                      <div>
                        <label 
                          htmlFor="phone"
                          style={{
                            fontFamily: 'AeonikPro, sans-serif',
                            fontWeight: 700,
                            fontSize: '14px',
                            color: '#E2DFD6',
                            display: 'block',
                            marginBottom: '0.5rem'
                          }}
                        >
                          Phone
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          className="w-full px-4 py-3 bg-transparent border-2 rounded-lg focus:outline-none focus:border-[#FF5B04] transition-colors"
                          style={{
                            borderColor: '#E2DFD6',
                            color: '#E2DFD6',
                            fontFamily: 'AeonikPro, sans-serif',
                            fontSize: '16px'
                          }}
                          placeholder="+41 XX XXX XX XX"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Studio Details */}
                {formStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <h3
                      style={{
                        fontFamily: 'AeonikPro, sans-serif',
                        fontWeight: 700,
                        fontSize: 'clamp(20px, 3vw, 28px)',
                        color: '#E2DFD6',
                        marginBottom: '1.5rem'
                      }}
                    >
                      Studio Details
                    </h3>

                    {/* Location */}
                    <div>
                      <label 
                        htmlFor="location"
                        style={{
                          fontFamily: 'AeonikPro, sans-serif',
                          fontWeight: 700,
                          fontSize: '14px',
                          color: '#E2DFD6',
                          display: 'block',
                          marginBottom: '0.5rem'
                        }}
                      >
                        Studio Location *
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        required
                        className="w-full px-4 py-3 bg-transparent border-2 rounded-lg focus:outline-none focus:border-[#FF5B04] transition-colors"
                        style={{
                          borderColor: '#E2DFD6',
                          color: '#E2DFD6',
                          fontFamily: 'AeonikPro, sans-serif',
                          fontSize: '16px'
                        }}
                        placeholder="City, Country"
                      />
                    </div>

                    {/* Studio Type */}
                    <div>
                      <label 
                        htmlFor="studioType"
                        style={{
                          fontFamily: 'AeonikPro, sans-serif',
                          fontWeight: 700,
                          fontSize: '14px',
                          color: '#E2DFD6',
                          display: 'block',
                          marginBottom: '0.5rem'
                        }}
                      >
                        Studio Type *
                      </label>
                      <select
                        id="studioType"
                        name="studioType"
                        required
                        className="w-full px-4 py-3 bg-[#000000] border-2 rounded-lg focus:outline-none focus:border-[#FF5B04] transition-colors cursor-pointer"
                        style={{
                          borderColor: '#E2DFD6',
                          color: '#E2DFD6',
                          fontFamily: 'AeonikPro, sans-serif',
                          fontSize: '16px'
                        }}
                      >
                        <option value="" style={{ backgroundColor: '#000000' }}>Select studio type</option>
                        <option value="recording" style={{ backgroundColor: '#000000' }}>Recording Studio</option>
                        <option value="production" style={{ backgroundColor: '#000000' }}>Production Studio</option>
                        <option value="rehearsal" style={{ backgroundColor: '#000000' }}>Rehearsal Space</option>
                        <option value="mixing" style={{ backgroundColor: '#000000' }}>Mixing Studio</option>
                        <option value="mastering" style={{ backgroundColor: '#000000' }}>Mastering Studio</option>
                        <option value="home" style={{ backgroundColor: '#000000' }}>Home Studio</option>
                        <option value="other" style={{ backgroundColor: '#000000' }}>Other</option>
                      </select>
                    </div>

                    {/* Website/Social Media */}
                    <div>
                      <label 
                        htmlFor="website"
                        style={{
                          fontFamily: 'AeonikPro, sans-serif',
                          fontWeight: 700,
                          fontSize: '14px',
                          color: '#E2DFD6',
                          display: 'block',
                          marginBottom: '0.5rem'
                        }}
                      >
                        Website or Social Media
                      </label>
                      <input
                        type="url"
                        id="website"
                        name="website"
                        className="w-full px-4 py-3 bg-transparent border-2 rounded-lg focus:outline-none focus:border-[#FF5B04] transition-colors"
                        style={{
                          borderColor: '#E2DFD6',
                          color: '#E2DFD6',
                          fontFamily: 'AeonikPro, sans-serif',
                          fontSize: '16px'
                        }}
                        placeholder="https://..."
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Additional Info */}
                {formStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <h3
                      style={{
                        fontFamily: 'AeonikPro, sans-serif',
                        fontWeight: 700,
                        fontSize: 'clamp(20px, 3vw, 28px)',
                        color: '#E2DFD6',
                        marginBottom: '1.5rem'
                      }}
                    >
                      Tell us more
                    </h3>

                    {/* Additional Information */}
                    <div>
                      <label 
                        htmlFor="message"
                        style={{
                          fontFamily: 'AeonikPro, sans-serif',
                          fontWeight: 700,
                          fontSize: '14px',
                          color: '#E2DFD6',
                          display: 'block',
                          marginBottom: '0.5rem'
                        }}
                      >
                        Tell us about your studio
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={8}
                        className="w-full px-4 py-3 bg-transparent border-2 rounded-lg focus:outline-none focus:border-[#FF5B04] transition-colors resize-none"
                        style={{
                          borderColor: '#E2DFD6',
                          color: '#E2DFD6',
                          fontFamily: 'AeonikPro, sans-serif',
                          fontSize: '16px'
                        }}
                        placeholder="Tell us about your equipment, services, special features, hourly rates, or anything else you'd like us to know..."
                      />
                    </div>
                  </motion.div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-4 pt-4">
                  {formStep > 1 && (
                    <motion.button
                      type="button"
                      onClick={() => setFormStep(formStep - 1)}
                      className="px-8 py-3 rounded-lg font-bold"
                      style={{
                        backgroundColor: 'transparent',
                        color: '#E2DFD6',
                        fontFamily: 'AeonikPro, sans-serif',
                        border: '2px solid #E2DFD6',
                        cursor: 'pointer'
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Back
                    </motion.button>
                  )}
                  
                  {formStep === 1 && (
                    <motion.button
                      type="button"
                      onClick={() => setShowRegistrationForm(false)}
                      className="px-8 py-3 rounded-lg font-bold"
                      style={{
                        backgroundColor: 'transparent',
                        color: '#E2DFD6',
                        fontFamily: 'AeonikPro, sans-serif',
                        border: '2px solid #E2DFD6',
                        cursor: 'pointer'
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                  )}

                  <motion.button
                    type="submit"
                    className="flex-1 px-8 py-3 rounded-lg font-bold"
                    style={{
                      backgroundColor: '#FF5B04',
                      color: '#000000',
                      fontFamily: 'AeonikPro, sans-serif',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    whileHover={{ scale: 1.02, backgroundColor: '#ED7B32' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {formStep === 3 ? 'Submit Registration' : 'Continue'}
                  </motion.button>
                </div>
              </motion.form>
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* Menu Overlay - CD Back Cover Style */}
      <motion.div
        className="fixed inset-0 z-[9000] overflow-hidden"
        style={{ backgroundColor: 'transparent' }}
        initial={{ y: '-100%' }}
        animate={{ 
          y: isMenuOpen ? 0 : '-100%'
        }}
        transition={{ 
          duration: 0.6, 
          ease: [0.25, 0.1, 0.25, 1],
          delay: isMenuOpen ? 0.1 : 0
        }}
      >
        {/* Three vertical rectangles */}
        <div className="flex w-full" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 64px)', height: '100%' }}>
          {/* First rectangle - 10% width */}
          <div 
            className="border-r border-[#E2DFD6] flex items-center justify-center"
            style={{ width: '10%', height: 'calc(100vh - env(safe-area-inset-top, 0px) - 64px)', backgroundColor: '#000000' }}
          >
            <motion.div
              className="flex flex-col items-center"
              initial="hidden"
              animate={isMenuOpen ? "show" : "hidden"}
              variants={{
                hidden: { opacity: 0 },
                show: { opacity: 1 }
              }}
              transition={{ duration: 0.3, ease: 'easeOut', delay: 0.3 }}
              style={{ transform: 'rotate(180deg)' }}
            >
              <p
                style={{
                  writingMode: 'vertical-rl',
                  textOrientation: 'mixed',
                  fontFamily: 'AeonikPro, sans-serif',
                  fontStyle: 'italic',
                  fontWeight: 700,
                  color: '#E2DFD6',
                  fontSize: '0.875rem',
                  letterSpacing: '0.1em'
                }}
              >
                THE VERY BEST OF
              </p>
               <p
                 className={moslin.className}
                 style={{
                   writingMode: 'vertical-rl',
                   textOrientation: 'mixed',
                   color: '#E2DFD6',
                   fontSize: '1.25rem',
                   marginTop: '1rem'
                 }}
               >
                 STUDUO
               </p>
            </motion.div>
          </div>

          {/* Second rectangle - 90% width (contains menu items) */}
          <div 
            className="flex flex-col relative"
            style={{ width: '90%', backgroundColor: 'rgba(0, 0, 0, 0.5)', height: 'calc(100vh - env(safe-area-inset-top, 0px) - 64px)' }}
          >
        {/* Sticker image at the top */}
        <div 
          className="absolute left-1/2 -translate-x-1/2 top-8 md:top-14 pointer-events-none"
          style={{ zIndex: 1 }}
        >
          <img 
            src="/assets/images/sticker.png" 
            alt="Studuo sticker"
            className="h-32 w-auto md:h-48"
          />
        </div>
            <div className="px-8 md:px-16 flex-shrink-0 absolute top-1/2 left-0 right-0 -translate-y-1/2">
          <motion.div
            className="space-y-6 md:space-y-8"
            initial="hidden"
            animate={isMenuOpen ? "show" : "hidden"}
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                      staggerChildren: 0.05,
                      delayChildren: 0.25
                }
              }
            }}
          >
                {['Home', 'Features', 'Join', 'Locations', 'About', 'Register your studio'].map((item, index) => (
              <motion.div
                key={item}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <a
                  href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`${deFonte.className} text-2xl md:text-3xl hover:opacity-70 transition-opacity block flex items-baseline gap-4`}
                  style={{ 
                    color: '#E2DFD6'
                  }}
                  onClick={(e) => {
                    e.preventDefault()
                        // Close menu and scroll simultaneously for fast animation
                    setIsMenuOpen(false)
                        // Start scrolling immediately without waiting for menu to close
                        setTimeout(() => {
                    const section = item.toLowerCase().replace(/\s+/g, '-')
                    if (section === 'home') {
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    } else if (section === 'features') {
                      const el = document.getElementById('showcase')
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }
                    } else if (section === 'join') {
                      const el = document.getElementById('features')
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }
                    } else if (section === 'register-your-studio') {
                      const el = document.getElementById('contact')
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }
                    } else {
                      const el = document.getElementById(section)
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }
                    }
                        }, 50)
                  }}
                >
                  <span className="text-sm opacity-50">0{index + 1}</span>
                  <span>{item}</span>
                </a>
              </motion.div>
            ))}
          </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Loading Screen */}
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{ backgroundColor: '#000000' }}
        initial={{ opacity: 1 }}
        animate={{ 
          opacity: showLoadingScreen ? 1 : 0,
          pointerEvents: showLoadingScreen ? 'auto' : 'none'
        }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      >
        <motion.span
          className={`${moslin.className}`}
          style={{ fontSize: '3rem', color: '#E2DFD6' }}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: showLoadingScreen ? 1 : 0
          }}
          transition={{ 
            duration: 0.5, 
            ease: 'easeInOut'
          }}
        >
          ∑
        </motion.span>
      </motion.div>
    </main>
  )
}
