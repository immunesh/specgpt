'use client'
import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { CapgeminiLogo } from '@/components/shared/CapgeminiLogo'

const benefits = [
  'No credit card required',
  'Full 3GPP Rel-15–18 access',
  'Enterprise SSO support',
  'SOC 2 compliant',
]

export function CTASection() {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section ref={ref} className="relative py-32 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #060C1A 0%, #080F1E 100%)' }}>
      {/* Aurora blobs */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(0,174,239,0.1) 0%, rgba(124,58,237,0.07) 50%, transparent 70%)' }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: `linear-gradient(rgba(0,174,239,1) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(0,174,239,1) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <CapgeminiLogo light size="lg" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display font-bold text-white mb-6"
          style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', lineHeight: 1.05 }}
        >
          Ready to accelerate your
          <br />
          <span style={{
            background: 'linear-gradient(135deg, #00AEEF 0%, #5BB8D4 50%, #7C3AED 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            5G development?
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg mb-10 max-w-2xl mx-auto"
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          Join engineering teams at leading telecoms companies using 5G SpecGPT to ship
          faster, reduce spec lookup time, and build with confidence.
        </motion.p>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-10"
        >
          {benefits.map((b) => (
            <div key={b} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#10B981' }} />
              {b}
            </div>
          ))}
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.97 }}>
            <Link href="/register"
              className="flex items-center gap-2 px-10 py-4 rounded-2xl text-base font-bold text-white transition-all"
              style={{
                background: 'linear-gradient(135deg, #00AEEF 0%, #0070F3 100%)',
                boxShadow: '0 0 40px rgba(0,174,239,0.35), 0 8px 32px rgba(0,0,0,0.3)',
              }}
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link href="/login"
              className="px-10 py-4 rounded-2xl text-base font-medium transition-all"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              Sign in
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
