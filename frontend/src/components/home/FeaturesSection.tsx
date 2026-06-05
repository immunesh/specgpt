'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Zap, Shield, BookOpen, Network, Cpu, Globe } from 'lucide-react'

const features = [
  {
    icon: Zap,
    color: '#00AEEF',
    title: 'Instant Answers',
    desc: 'Get precise, citation-backed answers from 3GPP, O-RAN, and ETSI specs in seconds — no manual searching required.',
  },
  {
    icon: BookOpen,
    color: '#7C3AED',
    title: 'Exact Citations',
    desc: 'Every answer references the exact specification, release, section, and page number so engineers can verify instantly.',
  },
  {
    icon: Shield,
    color: '#10B981',
    title: 'Enterprise Security',
    desc: 'Role-based access control, audit logging, and enterprise SSO. Your IP stays protected with ISO-grade security.',
  },
  {
    icon: Network,
    color: '#F59E0B',
    title: 'Full 5G Coverage',
    desc: 'Comprehensive knowledge of 5G NR, 5GC, NSSAI, PDCCH, AMF, UPF, and all Rel-15 through Rel-18 specifications.',
  },
  {
    icon: Cpu,
    color: '#EC4899',
    title: 'AI-Powered RAG',
    desc: 'Retrieval-Augmented Generation ensures answers come from your approved documents — not hallucinated training data.',
  },
  {
    icon: Globe,
    color: '#06B6D4',
    title: 'Multi-Standard',
    desc: 'Covers 3GPP TS/TR series, O-RAN specifications, ETSI NFV standards, and proprietary Capgemini knowledge base.',
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}
const card = {
  hidden: { opacity: 0, y: 40 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export function FeaturesSection() {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="features" className="relative py-32 overflow-hidden" style={{ background: '#060C1A' }}>
      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(rgba(0,174,239,1) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(0,174,239,1) 1px, transparent 1px)`,
        backgroundSize: '80px 80px',
      }} />

      {/* Glow blob */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none" style={{
        background: 'radial-gradient(ellipse, rgba(0,174,239,0.07) 0%, transparent 70%)',
      }} />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
            style={{ background: 'rgba(0,174,239,0.1)', border: '1px solid rgba(0,174,239,0.2)', color: '#00AEEF' }}>
            Platform Features
          </span>
          <h2 className="font-display font-bold text-white mb-4"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}>
            Everything your team needs
          </h2>
          <p className="max-w-xl mx-auto text-base" style={{ color: 'rgba(255,255,255,0.45)' }}>
            A complete AI platform purpose-built for 5G telecommunications engineers,
            architects, and standards teams.
          </p>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate={inView ? 'show' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map(({ icon: Icon, color, title, desc }) => (
            <motion.div
              key={title}
              variants={card}
              whileHover={{ y: -6, scale: 1.01 }}
              className="group relative p-7 rounded-3xl cursor-default overflow-hidden transition-all duration-300"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(circle at top left, ${color}12 0%, transparent 60%)` }} />

              {/* Top border gradient on hover */}
              <div className="absolute top-0 inset-x-0 h-px rounded-t-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }} />

              {/* Icon */}
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110"
                style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                <Icon className="w-6 h-6" style={{ color }} />
              </div>

              <h3 className="font-display font-semibold text-lg text-white mb-3">{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{desc}</p>

              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-7 right-7 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `linear-gradient(90deg, ${color}40, transparent)` }} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
