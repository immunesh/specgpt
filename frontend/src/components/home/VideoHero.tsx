'use client'
import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { ChevronDown, Volume2, VolumeX } from 'lucide-react'

/* ─── Animated rising particles ─── */
function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 40 }).map((_, i) => {
        const size  = 1 + (i % 3)
        const left  = `${(i * 2.5) % 100}%`
        const delay = (i * 0.18) % 6
        const dur   = 6 + (i % 5)
        const color = i % 3 === 0 ? '#00AEEF' : i % 3 === 1 ? '#7C3AED' : '#0070F3'
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{ width: size * 2, height: size * 2, left, top: '100%', background: color, opacity: 0 }}
            animate={{ y: [0, -900], opacity: [0, 0.7, 0] }}
            transition={{ duration: dur, delay, repeat: Infinity, ease: 'linear' }}
          />
        )
      })}
    </div>
  )
}


/* ─── Sound toggle button ─── */
function SoundToggle({ muted, onToggle }: { muted: boolean; onToggle: () => void }) {
  return (
    <motion.button
      onClick={onToggle}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.8, duration: 0.4 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.93 }}
      aria-label={muted ? 'Unmute video' : 'Mute video'}
      className="absolute bottom-20 right-6 z-20 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl group"
      style={{
        background: 'rgba(0,0,0,0.45)',
        border: '1px solid rgba(255,255,255,0.15)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {/* Animated sound-wave rings when unmuted */}
      {!muted && (
        <span className="relative flex items-center justify-center w-5 h-5">
          <motion.span
            className="absolute inline-flex rounded-full"
            style={{ border: '1.5px solid #00AEEF', width: '100%', height: '100%' }}
            animate={{ scale: [1, 1.7], opacity: [0.6, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
          />
          <Volume2 className="w-4 h-4 relative z-10" style={{ color: '#00AEEF' }} />
        </span>
      )}
      {muted && (
        <VolumeX className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.55)' }} />
      )}

      <span className="text-xs font-semibold select-none" style={{ color: muted ? 'rgba(255,255,255,0.55)' : '#00AEEF' }}>
        {muted ? 'Sound Off' : 'Sound On'}
      </span>

      {/* Glow when sound is on */}
      <AnimatePresence>
        {!muted && (
          <motion.span
            key="glow"
            className="absolute inset-0 rounded-2xl pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ boxShadow: '0 0 16px rgba(0,174,239,0.35), inset 0 0 12px rgba(0,174,239,0.08)' }}
          />
        )}
      </AnimatePresence>
    </motion.button>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════ */
export function VideoHero() {
  const videoRef   = useRef<HTMLVideoElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [muted,  setMuted]  = useState(true)   // starts muted (browser policy)

  const { scrollY } = useScroll()
  useTransform(scrollY, [0, 600], [0, -80])

  /* Detect when video data is ready */
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const onLoad = () => setLoaded(true)
    v.addEventListener('loadeddata', onLoad)
    if (v.readyState >= 3) setLoaded(true)
    return () => v.removeEventListener('loadeddata', onLoad)
  }, [])

  /* Sync muted state → video element */
  const handleSoundToggle = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative w-full overflow-hidden"
      style={{ height: '100svh', minHeight: 600 }}
    >
      {/* ─── Video layer ─── */}
      <div className="absolute inset-0">

        {/* Premium ring loader — shown until video ready */}
        <AnimatePresence>
          {!loaded && (
            <motion.div
              key="loader"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 z-10 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #060C1A 0%, #0A1428 50%, #060C1A 100%)' }}
            >
              <div className="relative">
                <motion.div className="w-20 h-20 rounded-full"
                  style={{ border: '2px solid rgba(0,174,239,0.15)' }} />
                <motion.div className="absolute inset-0 w-20 h-20 rounded-full"
                  style={{ border: '2px solid transparent', borderTopColor: '#00AEEF' }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                <motion.div className="absolute inset-2 w-16 h-16 rounded-full"
                  style={{ border: '2px solid transparent', borderTopColor: '#7C3AED' }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase">Loading</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/*
          ══════════════════════════════════════════════════
          VIDEO FILE — to swap the video:
            1. Drop your new .mp4 file into  /public/
            2. Update the src below to match the filename
          ══════════════════════════════════════════════════
        */}
        <video
          ref={videoRef}
          autoPlay
          muted          /* always start muted — user can unmute via the button */
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.6) saturate(1.15)' }}
        >
          <source src="/Create_a_premium_cinematic_G (1).mp4" type="video/mp4" />
        </video>

        {/* Multi-layer depth overlay */}
        <div className="absolute inset-0" style={{
          background: `linear-gradient(to bottom,
            rgba(6,12,26,0.55)  0%,
            rgba(6,12,26,0.08)  40%,
            rgba(6,12,26,0.18)  70%,
            rgba(6,12,26,0.96) 100%)`,
        }} />
        {/* Left vignette */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, rgba(6,12,26,0.65) 0%, transparent 55%)' }} />
        {/* Chromatic top line */}
        <div className="absolute top-0 inset-x-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(0,174,239,0.6), transparent)' }} />
      </div>

      {/* ─── Particles ─── */}
      <Particles />



      {/* ─── Sound toggle ─── */}
      <SoundToggle muted={muted} onToggle={handleSoundToggle} />

      {/* ─── Scroll indicator ─── */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <span className="text-[10px] uppercase tracking-widest"
          style={{ color: 'rgba(255,255,255,0.3)' }}>
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.3)' }} />
        </motion.div>
      </motion.div>

      {/* ─── Bottom fade into next section ─── */}
      <div className="absolute bottom-0 inset-x-0 h-40 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #060C1A)' }} />
    </section>
  )
}
