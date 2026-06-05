'use client'
import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const stats = [
  { value: 3000,   suffix: '+', label: 'Spec Documents',    desc: '3GPP, O-RAN, ETSI indexed',   color: '#00AEEF' },
  { value: 4,      suffix: ' Releases', label: '3GPP Releases', desc: 'Rel-15 through Rel-18',   color: '#7C3AED' },
  { value: 99.9,   suffix: '%', label: 'Uptime SLA',        desc: 'Enterprise-grade reliability', color: '#10B981' },
  { value: 500,    suffix: 'ms', label: 'Avg Response',     desc: 'Sub-second AI answers',        color: '#F59E0B' },
]

function AnimatedCounter({ target, suffix, started }: { target: number; suffix: string; started: boolean }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!started) return
    const duration = 1800
    const steps    = 60
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current = Math.min(current + increment, target)
      setCount(current)
      if (current >= target) clearInterval(timer)
    }, duration / steps)
    return () => clearInterval(timer)
  }, [started, target])

  const display = target % 1 !== 0
    ? count.toFixed(1)
    : Math.round(count).toLocaleString()

  return <>{display}{suffix}</>
}

export function StatsSection() {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section id="stats" ref={ref} className="relative py-24 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #060C1A 0%, #080F1E 100%)' }}>
      {/* Animated gradient bg */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(0,174,239,0.06) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
            style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', color: '#7C3AED' }}>
            By the Numbers
          </span>
          <h2 className="font-display font-bold text-white"
            style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
            Trusted by enterprise telecoms teams
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map(({ value, suffix, label, desc, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              whileHover={{ y: -4 }}
              className="relative p-8 rounded-3xl text-center overflow-hidden group"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${color}25`,
              }}
            >
              {/* Glow bg */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(circle at 50% 50%, ${color}10 0%, transparent 70%)` }} />

              {/* Glow pulse ring */}
              <motion.div
                className="absolute top-4 right-4 w-3 h-3 rounded-full"
                style={{ background: color }}
                animate={{ scale: [1, 1.6, 1], opacity: [0.8, 0, 0.8] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
              />

              <div className="relative">
                <div className="font-display font-bold mb-2" style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', color }}>
                  <AnimatedCounter target={value} suffix={suffix} started={inView} />
                </div>
                <div className="font-semibold text-white text-sm mb-1">{label}</div>
                <div className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
