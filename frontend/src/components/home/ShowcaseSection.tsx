'use client'
import { useRef } from 'react'
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { MessageSquare, Sparkles, BookOpen, Pin } from 'lucide-react'

/* ─── 3D tilt card ─── */
function TiltCard({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 200, damping: 20 })
  const sy = useSpring(y, { stiffness: 200, damping: 20 })
  const rotateX = useTransform(sy, [-0.5, 0.5], ['8deg', '-8deg'])
  const rotateY = useTransform(sx, [-0.5, 0.5], ['-8deg', '8deg'])

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top)  / rect.height - 0.5)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={() => { x.set(0); y.set(0) }}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1000, ...style }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─── Mock chat UI ─── */
function MockChatUI() {
  const messages = [
    { role: 'user', text: 'What is CORESET in 5G NR?' },
    { role: 'ai',   text: 'CORESET (Control Resource Set) is a set of physical resources in the frequency domain where the UE monitors for PDCCH candidates. Per TS 38.213 §10.1...' },
    { role: 'user', text: 'What is the maximum bandwidth for FR2?' },
    { role: 'ai',   text: 'For FR2 (mmWave), the maximum carrier bandwidth is 400 MHz per TS 38.101-2 Table 5.3.5-1...' },
  ]

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden" style={{ transformStyle: 'preserve-3d' }}>
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 flex-shrink-0"
        style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex gap-1.5">
          {['#FF5F57','#FEBC2E','#28C840'].map(c => (
            <div key={c} className="w-3 h-3 rounded-full" style={{ background: c, opacity: 0.8 }} />
          ))}
        </div>
        <div className="flex-1 mx-4">
          <div className="h-5 rounded-lg flex items-center px-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>5G SpecGPT · Capgemini</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-3 overflow-hidden">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + i * 0.3, duration: 0.5 }}
            className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={m.role === 'ai'
                ? { background: 'linear-gradient(135deg, #00AEEF, #0070F3)' }
                : { background: 'rgba(255,255,255,0.1)' }}>
              {m.role === 'ai'
                ? <Sparkles className="w-3 h-3 text-white" />
                : <MessageSquare className="w-3 h-3 text-white/60" />}
            </div>
            <div className="max-w-[78%] px-3 py-2 rounded-xl text-[11px] leading-relaxed"
              style={m.role === 'user'
                ? { background: 'rgba(0,174,239,0.15)', border: '1px solid rgba(0,174,239,0.2)', color: 'rgba(255,255,255,0.85)' }
                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.75)' }}>
              {m.text}
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
          className="flex gap-2"
        >
          <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #00AEEF, #0070F3)' }}>
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <div className="px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex gap-1 items-center h-4">
              {[0,1,2].map(i => (
                <motion.span key={i} className="w-1.5 h-1.5 rounded-full"
                  style={{ background: '#00AEEF' }}
                  animate={{ y: [0,-4,0], opacity:[0.4,1,0.4] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i*0.15 }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Input bar */}
      <div className="px-3 pb-3 flex-shrink-0">
        <div className="flex items-center gap-2 h-9 px-3 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <span className="text-[10px] flex-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Ask a 5G specification question…
          </span>
          <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #00AEEF, #0070F3)' }}>
            <Sparkles className="w-3 h-3 text-white" />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Side info cards ─── */
function InfoCard({ icon: Icon, color, title, value, delay }: {
  icon: React.ElementType; color: string; title: string; value: string; delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ x: -4 }}
      className="flex items-center gap-3 p-4 rounded-2xl"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <div className="text-xs font-medium text-white">{title}</div>
        <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{value}</div>
      </div>
    </motion.div>
  )
}

export function ShowcaseSection() {
  const ref    = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="capabilities" ref={ref} className="relative py-32 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #080F1E 0%, #060C1A 100%)' }}>
      {/* Radial glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)' }} />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,174,239,0.06) 0%, transparent 70%)' }} />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: text */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ duration: 0.5 }}
              className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
              style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', color: '#7C3AED' }}
            >
              Platform Capabilities
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ duration: 0.65, delay: 0.1 }}
              className="font-display font-bold text-white mb-6"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
            >
              Ask. Receive.
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #7C3AED, #00AEEF)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                Verify. Ship.
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity:1, y:0 } : {}} transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base leading-relaxed mb-8"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              5G SpecGPT eliminates the hours spent manually searching through hundreds of
              specification documents. Ask in natural language, get a precise answer with
              references, and continue building.
            </motion.p>

            {/* Capability cards */}
            <div className="space-y-3">
              <InfoCard icon={Sparkles}     color="#00AEEF" title="Natural Language Queries"  value="Ask complex 5G questions in plain English"    delay={0.3} />
              <InfoCard icon={BookOpen}     color="#7C3AED" title="Source Citations"           value="Every answer references exact spec documents"  delay={0.4} />
              <InfoCard icon={Pin}          color="#10B981" title="Pinned Conversations"       value="Save and revisit key spec discussions"          delay={0.5} />
              <InfoCard icon={MessageSquare} color="#F59E0B" title="Team Collaboration"        value="Multi-user access with role-based permissions"  delay={0.6} />
            </div>
          </div>

          {/* Right: 3D mock UI */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <TiltCard
              className="relative rounded-3xl overflow-hidden"
              style={{
                height: 480,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.09)',
                boxShadow: '0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
              }}
            >
              <MockChatUI />

              {/* Floating glow overlay */}
              <div className="absolute inset-0 pointer-events-none rounded-3xl"
                style={{ background: 'linear-gradient(135deg, rgba(0,174,239,0.04) 0%, transparent 60%)' }} />
            </TiltCard>

            {/* Decorative floating dots */}
            {[
              { top: '-8%', left: '-6%',  size: 80, color: '#00AEEF', delay: 0   },
              { top: '85%', right: '-4%', size: 50, color: '#7C3AED', delay: 1.5 },
            ].map((d, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: d.size, height: d.size,
                  top: d.top, left: (d as { left?: string }).left, right: (d as { right?: string }).right,
                  background: `radial-gradient(circle, ${d.color}30 0%, transparent 70%)`,
                }}
                animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: d.delay }}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
