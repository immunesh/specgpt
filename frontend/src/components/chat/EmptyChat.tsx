'use client'
import { motion } from 'framer-motion'
import { Zap, Shield, BookOpen, Cpu, Network, Radio } from 'lucide-react'

interface Props {
  onSelectPrompt: (prompt: string) => void
}

const STARTER_PROMPTS = [
  {
    label: '5G NR Architecture',
    icon: Network,
    color: '#00AEEF',
    prompt: 'Explain the overall 5G NR architecture and the key interfaces between gNB, AMF, and UPF per TS 38.300.',
  },
  {
    label: 'PDCCH & CORESET',
    icon: Radio,
    color: '#7C3AED',
    prompt: 'What is CORESET and how does PDCCH scheduling work in 5G NR? Reference TS 38.211 and TS 38.213.',
  },
  {
    label: 'Network Slicing',
    icon: Cpu,
    color: '#5BB8D4',
    prompt: 'How does network slicing work in 5GC? Explain S-NSSAI, NSSAI selection, and the role of NSSF per TS 23.501.',
  },
  {
    label: '5G Security (SUCI)',
    icon: Shield,
    color: '#10B981',
    prompt: 'Explain SUPI concealment using SUCI and the AUSF authentication flow per TS 33.501.',
  },
  {
    label: 'AMF Registration',
    icon: BookOpen,
    color: '#F59E0B',
    prompt: 'Walk me through the 5G NR initial registration procedure between UE and AMF, referencing TS 23.502.',
  },
  {
    label: 'FR1 vs FR2 Bands',
    icon: Zap,
    color: '#EC4899',
    prompt: 'What is the difference between FR1 and FR2 in 5G NR? What are the bandwidth limits and use cases per TS 38.101?',
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.3 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } },
}

export function EmptyChat({ onSelectPrompt }: Props) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center overflow-auto relative">
      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(0,174,239,0.07) 0%, transparent 70%)',
        }}
      />

      {/* Floating orbs */}
      {[
        { x: '15%', y: '20%', size: 5, color: '#00AEEF', delay: 0   },
        { x: '80%', y: '25%', size: 4, color: '#7C3AED', delay: 1.5 },
        { x: '10%', y: '70%', size: 6, color: '#5BB8D4', delay: 0.8 },
        { x: '85%', y: '65%', size: 3, color: '#00AEEF', delay: 2.5 },
        { x: '50%', y: '10%', size: 4, color: '#7C3AED', delay: 1.2 },
      ].map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: orb.x, top: orb.y,
            width: orb.size * 4, height: orb.size * 4,
            background: `radial-gradient(circle, ${orb.color}50 0%, transparent 70%)`,
          }}
          animate={{ y: [0, -12, 0], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: orb.delay }}
        />
      ))}

      {/* Hero Icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
        className="relative mb-8"
      >
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,174,239,0.15) 0%, transparent 70%)', inset: '-24px' }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Icon container */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="relative w-24 h-24 rounded-3xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #00AEEF 0%, #0070F3 60%, #7C3AED 100%)',
            boxShadow: '0 0 40px rgba(0,174,239,0.4), 0 0 80px rgba(0,174,239,0.15), 0 20px 40px rgba(0,0,0,0.3)',
          }}
        >
          <span className="text-white font-display font-bold text-3xl tracking-tighter">5G</span>
        </motion.div>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="space-y-3 mb-3"
      >
        <h1 className="text-3xl font-display font-bold text-white tracking-tight">
          5G SpecGPT
        </h1>
        <p className="text-white/45 text-sm max-w-md leading-relaxed">
          Expert AI for 3GPP, O-RAN, and ETSI specifications.
          <br />Every answer cites the exact specification and section.
        </p>
      </motion.div>

      {/* Capgemini tag */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="mb-10"
      >
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
          style={{
            background: 'rgba(0,174,239,0.1)',
            border: '1px solid rgba(0,174,239,0.2)',
            color: '#5BB8D4',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: '#00AEEF' }}
          />
          Powered by Capgemini Engineering
        </span>
      </motion.div>

      {/* Prompt grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-3xl"
      >
        {STARTER_PROMPTS.map(({ label, icon: Icon, color, prompt }) => (
          <motion.button
            key={label}
            variants={item}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectPrompt(prompt)}
            className="text-left p-4 rounded-2xl transition-all group relative overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            {/* Hover glow */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"
              style={{ background: `radial-gradient(circle at top left, ${color}15 0%, transparent 60%)` }}
            />

            <div className="relative">
              {/* Icon */}
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center mb-3 transition-all group-hover:scale-110"
                style={{ background: `${color}20`, border: `1px solid ${color}30` }}
              >
                <Icon className="h-4 w-4" style={{ color }} />
              </div>

              <p
                className="text-sm font-semibold mb-1.5 transition-colors"
                style={{ color: 'rgba(255,255,255,0.8)' }}
              >
                {label}
              </p>
              <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {prompt}
              </p>
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Footer note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-[11px] mt-8"
        style={{ color: 'rgba(255,255,255,0.2)' }}
      >
        Knowledge base: 3GPP Rel-15 through Rel-18 · O-RAN · ETSI NFV
      </motion.p>
    </div>
  )
}
