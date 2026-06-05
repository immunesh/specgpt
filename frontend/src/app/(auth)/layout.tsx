'use client'
import { motion } from 'framer-motion'
import { CapgeminiLogo } from '@/components/shared/CapgeminiLogo'

const stats = [
  { label: '3GPP Releases', value: '15–18' },
  { label: 'TS Series', value: '38, 23, 29, 33' },
  { label: 'Standards', value: 'O-RAN, ETSI' },
  { label: 'AI Engine', value: 'Claude' },
]

const features = [
  { icon: '⚡', text: 'Instant spec citations from 3GPP, O-RAN & ETSI' },
  { icon: '🔒', text: 'Enterprise-grade security & access control' },
  { icon: '🤖', text: 'Powered by state-of-the-art AI (Claude)' },
  { icon: '📡', text: 'Built for telecom engineers & architects' },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[#060C1A] overflow-hidden">
      {/* ─── Left branding panel ─── */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col overflow-hidden">
        {/* Animated mesh background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#060C1A] via-[#0A1428] to-[#060C1A]" />

          {/* Aurora blobs */}
          <motion.div
            className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(0,174,239,0.18) 0%, transparent 70%)' }}
            animate={{ x: [0, 30, 0], y: [0, 20, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-[-10%] right-[-10%] w-[65%] h-[65%] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.14) 0%, transparent 70%)' }}
            animate={{ x: [0, -20, 0], y: [0, -20, 0], scale: [1, 1.08, 1] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          />
          <motion.div
            className="absolute top-[40%] right-[10%] w-[45%] h-[45%] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(0,112,243,0.12) 0%, transparent 70%)' }}
            animate={{ x: [0, 15, 0], y: [0, -15, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
          />

          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(rgba(0,174,239,1) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(0,174,239,1) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        {/* Floating orbs */}
        <div className="absolute inset-0 pointer-events-none">
          {[
            { size: 6, top: '15%', left: '20%', delay: 0,   dur: 7  },
            { size: 4, top: '55%', left: '12%', delay: 1.5, dur: 9  },
            { size: 8, top: '35%', left: '75%', delay: 0.8, dur: 11 },
            { size: 5, top: '72%', left: '60%', delay: 2,   dur: 8  },
            { size: 3, top: '85%', left: '30%', delay: 3,   dur: 6  },
            { size: 7, top: '20%', left: '50%', delay: 1,   dur: 10 },
          ].map((orb, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width:  orb.size * 4,
                height: orb.size * 4,
                top: orb.top,
                left: orb.left,
                background: i % 2 === 0
                  ? 'radial-gradient(circle, rgba(0,174,239,0.5) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(124,58,237,0.5) 0%, transparent 70%)',
              }}
              animate={{ y: [0, -20, 0], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: orb.dur, repeat: Infinity, ease: 'easeInOut', delay: orb.delay }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <CapgeminiLogo light size="lg" />
          </motion.div>

          {/* Hero content */}
          <div className="flex-1 flex flex-col justify-center space-y-8 mt-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#00AEEF]/30 bg-[#00AEEF]/10 mb-6">
                <span className="w-2 h-2 rounded-full bg-[#00AEEF] animate-pulse" />
                <span className="text-[#00AEEF] text-xs font-medium tracking-wide uppercase">Enterprise AI Platform</span>
              </div>

              <h1 className="text-5xl font-display font-bold text-white leading-[1.1] tracking-tight mb-4">
                Your AI Expert for
                <br />
                <span
                  className="font-display"
                  style={{
                    background: 'linear-gradient(135deg, #00AEEF 0%, #5BB8D4 50%, #7C3AED 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  5G Specifications
                </span>
              </h1>
              <p className="text-white/60 text-lg leading-relaxed max-w-md">
                Instant, citation-backed answers from 3GPP, O-RAN, and ETSI standards.
                Built for telecom engineers by Capgemini.
              </p>
            </motion.div>

            {/* Feature list */}
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-sm">
                    {f.icon}
                  </div>
                  <span className="text-white/70 text-sm">{f.text}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Stats grid */}
            <motion.div
              className="grid grid-cols-2 gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {stats.map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-xl p-4 border"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    borderColor: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  <div className="text-white/40 text-xs font-medium uppercase tracking-wide mb-1">{label}</div>
                  <div className="text-white font-semibold text-sm">{value}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Footer */}
          <motion.p
            className="text-white/25 text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Powered by Anthropic Claude · Capgemini Engineering · 5G SpecGPT v1.0
          </motion.p>
        </div>
      </div>

      {/* ─── Right form panel ─── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        {/* Subtle background for right panel */}
        <div className="absolute inset-0 bg-[#070D1C]" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,174,239,0.06) 0%, transparent 70%)`,
          }}
        />

        <motion.div
          className="w-full max-w-md relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <CapgeminiLogo light size="lg" />
          </div>
          {children}
        </motion.div>
      </div>
    </div>
  )
}
