import type { Metadata } from 'next'
import { Navbar }          from '@/components/home/Navbar'
import { VideoHero }       from '@/components/home/VideoHero'
import { FeaturesSection } from '@/components/home/FeaturesSection'
import { StatsSection }    from '@/components/home/StatsSection'
import { ShowcaseSection } from '@/components/home/ShowcaseSection'
import { TechSection }     from '@/components/home/TechSection'
import { CTASection }      from '@/components/home/CTASection'
import { Footer }          from '@/components/home/Footer'

export const metadata: Metadata = {
  title: '5G SpecGPT | Capgemini — AI for 5G Specifications',
  description:
    'Instant, citation-backed answers from 3GPP, O-RAN, and ETSI 5G specifications. '
    + 'Enterprise AI platform built by Capgemini Engineering.',
  keywords: ['5G', '3GPP', 'O-RAN', 'ETSI', 'AI', 'Capgemini', 'telecom', 'specifications'],
  openGraph: {
    title: '5G SpecGPT by Capgemini',
    description: 'Enterprise AI for 5G telecom specifications',
    type: 'website',
  },
}

export default function HomePage() {
  return (
    <main className="min-h-screen" style={{ background: '#060C1A', color: '#fff' }}>
      {/* Fixed navigation */}
      <Navbar />

      {/* ── Cinematic video hero ── */}
      <VideoHero />

      {/* ── Platform features ── */}
      <FeaturesSection />

      {/* ── Animated stats ── */}
      <StatsSection />

      {/* ── 3D interactive showcase ── */}
      <ShowcaseSection />

      {/* ── Technology & standards ── */}
      <TechSection />

      {/* ── Call to action ── */}
      <CTASection />

      {/* ── Footer ── */}
      <Footer />
    </main>
  )
}
