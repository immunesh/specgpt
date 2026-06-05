'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CapgeminiLogo } from '@/components/shared/CapgeminiLogo'
import { Github, Linkedin, Twitter } from 'lucide-react'

interface NavItem { label: string; href: string; external?: boolean }
const links: Record<string, NavItem[]> = {
  Platform: [
    { label: 'Chat',        href: '/chat'     },
    { label: 'History',     href: '/history'  },
    { label: 'Spec Search', href: '/search'   },
    { label: 'Settings',    href: '/settings' },
  ],
  Standards: [
    { label: '3GPP TS 38',  href: '#' },
    { label: '3GPP TS 23',  href: '#' },
    { label: 'O-RAN Specs', href: '#' },
    { label: 'ETSI NFV',    href: '#' },
  ],
  Company: [
    { label: 'Capgemini.com',  href: 'https://www.capgemini.com', external: true },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Use',   href: '#' },
    { label: 'Contact',        href: '#' },
  ],
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden"
      style={{ background: '#040810', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      {/* Top glow */}
      <div className="absolute top-0 inset-x-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,174,239,0.4), transparent)' }} />

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Top row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-5">
            <CapgeminiLogo light size="md" />
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Enterprise AI platform for 5G telecommunications specifications.
              Built by Capgemini Engineering.
            </p>
            {/* Social */}
            <div className="flex items-center gap-3">
              {[
                { icon: Linkedin, href: 'https://www.linkedin.com/company/capgemini' },
                { icon: Twitter,  href: 'https://twitter.com/capgemini' },
                { icon: Github,   href: '#' },
              ].map(({ icon: Icon, href }, i) => (
                <motion.a
                  key={i} href={href} target="_blank" rel="noopener noreferrer"
                  whileHover={{ scale: 1.15, y: -2 }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <Icon className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.4)' }} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="text-xs font-semibold uppercase tracking-widest mb-4"
                style={{ color: 'rgba(255,255,255,0.25)' }}>
                {title}
              </h4>
              <ul className="space-y-2.5">
                {items.map(({ label, href, external }) => (
                  <li key={label}>
                    {external ? (
                      <a href={href} target="_blank" rel="noopener noreferrer"
                        className="text-sm transition-colors hover:text-[#00AEEF]"
                        style={{ color: 'rgba(255,255,255,0.45)' }}>
                        {label}
                      </a>
                    ) : (
                      <Link href={href}
                        className="text-sm transition-colors hover:text-[#00AEEF]"
                        style={{ color: 'rgba(255,255,255,0.45)' }}>
                        {label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
            © {new Date().getFullYear()} Capgemini SE. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            All systems operational · Powered by Anthropic Claude
          </div>
        </div>
      </div>
    </footer>
  )
}
