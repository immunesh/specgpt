'use client'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const standards = [
  { name: '3GPP',         sub: 'Rel-15 · 16 · 17 · 18', color: '#00AEEF' },
  { name: 'TS 38.xxx',    sub: '5G NR Radio',             color: '#7C3AED' },
  { name: 'TS 23.xxx',    sub: '5G System Architecture',  color: '#10B981' },
  { name: 'TS 29.xxx',    sub: 'Core Network APIs',       color: '#F59E0B' },
  { name: 'TS 33.xxx',    sub: '5G Security',             color: '#EC4899' },
  { name: 'O-RAN',        sub: 'Open RAN Specs',          color: '#06B6D4' },
  { name: 'ETSI NFV',     sub: 'Network Functions Virt.', color: '#00AEEF' },
  { name: 'Claude AI',    sub: 'Anthropic · LLM Engine',  color: '#7C3AED' },
]

const techPillars = [
  {
    title: 'Retrieval-Augmented Generation',
    desc: 'Combines vector search over your approved spec corpus with Claude\'s reasoning for accurate, traceable answers.',
    color: '#00AEEF',
    num: '01',
  },
  {
    title: 'Semantic Vector Search',
    desc: 'Finds the most relevant chunks across thousands of spec pages using state-of-the-art embedding models.',
    color: '#7C3AED',
    num: '02',
  },
  {
    title: 'Document Intelligence',
    desc: 'Automatically parses PDF specifications, preserving section structure, tables, and cross-references.',
    color: '#10B981',
    num: '03',
  },
]

export function TechSection() {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section id="technology" ref={ref} className="relative py-32 overflow-hidden"
      style={{ background: '#060C1A' }}>
      {/* bg dots grid */}
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: 'radial-gradient(rgba(0,174,239,1) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }} />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981' }}>
            Technology
          </span>
          <h2 className="font-display font-bold text-white mb-4"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
            Built on enterprise-grade AI
          </h2>
          <p className="max-w-lg mx-auto text-base" style={{ color: 'rgba(255,255,255,0.45)' }}>
            A purpose-built RAG pipeline optimised for the unique structure of telecom specifications.
          </p>
        </motion.div>

        {/* Tech pillars */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {techPillars.map(({ title, desc, color, num }, i) => (
            <motion.div
              key={num}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              whileHover={{ y: -4 }}
              className="relative p-7 rounded-3xl group overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(circle at top left, ${color}10 0%, transparent 60%)` }} />

              <div className="font-display font-bold text-4xl mb-4 opacity-10" style={{ color }}>
                {num}
              </div>
              <div className="w-10 h-1 rounded-full mb-5" style={{ background: color }} />
              <h3 className="font-semibold text-white text-base mb-3">{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Standards / compatibility strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-center text-xs font-semibold uppercase tracking-widest mb-8"
            style={{ color: 'rgba(255,255,255,0.25)' }}>
            Specification Coverage
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {standards.map(({ name, sub, color }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.5 + i * 0.06 }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="flex flex-col items-center px-5 py-3 rounded-2xl cursor-default"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${color}20`,
                }}
              >
                <span className="font-display font-bold text-sm mb-0.5" style={{ color }}>{name}</span>
                <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{sub}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
