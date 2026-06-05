'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Menu, X } from 'lucide-react'
import { CapgeminiLogo } from '@/components/shared/CapgeminiLogo'

const navLinks = [
  { label: 'Platform',      href: '#features'   },
  { label: 'Capabilities',  href: '#capabilities' },
  { label: 'Technology',    href: '#technology'  },
  { label: 'About',         href: '#stats'       },
]

export function Navbar() {
  const [scrolled,     setScrolled]     = useState(false)
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const { scrollY } = useScroll()
  const navBg = useTransform(scrollY, [0, 80], ['rgba(6,12,26,0)', 'rgba(6,12,26,0.95)'])

  useEffect(() => {
    const unsub = scrollY.on('change', (v) => setScrolled(v > 60))
    return unsub
  }, [scrollY])

  return (
    <>
      <motion.nav
        style={{ background: navBg }}
        className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div
          className="transition-all duration-300"
          style={scrolled ? { backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.07)' } : {}}
        >
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <CapgeminiLogo light size="lg" />
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="text-sm font-medium transition-all duration-200 hover:text-[#00AEEF]"
                  style={{ color: 'rgba(255,255,255,0.65)' }}
                >
                  {label}
                </a>
              ))}
            </div>

            {/* CTAs */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium px-4 py-2 rounded-xl transition-all"
                style={{ color: 'rgba(255,255,255,0.7)' }}
              >
                Sign in
              </Link>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/register"
                  className="flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 rounded-xl text-white transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #00AEEF, #0070F3)',
                    boxShadow: '0 0 20px rgba(0,174,239,0.3)',
                  }}
                >
                  Get Started <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg"
              style={{ color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.05)' }}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <motion.div
        initial={false}
        animate={mobileOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed top-20 inset-x-0 z-40 overflow-hidden md:hidden"
        style={{ background: 'rgba(6,12,26,0.98)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="px-6 py-6 space-y-4">
          {navLinks.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="block text-base font-medium py-2"
              style={{ color: 'rgba(255,255,255,0.75)' }}
            >
              {label}
            </a>
          ))}
          <div className="pt-4 flex flex-col gap-3">
            <Link href="/login" onClick={() => setMobileOpen(false)}
              className="text-center py-3 rounded-xl text-sm font-medium"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)' }}
            >Sign in</Link>
            <Link href="/register" onClick={() => setMobileOpen(false)}
              className="text-center py-3 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #00AEEF, #0070F3)' }}
            >Get Started</Link>
          </div>
        </div>
      </motion.div>
    </>
  )
}
