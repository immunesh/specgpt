import type { Metadata } from 'next'
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google'
import { Providers } from '@/components/shared/Providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['300', '400', '500', '600', '700'],
})
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
})

export const metadata: Metadata = {
  title: { default: '5G SpecGPT | Capgemini', template: '%s | 5G SpecGPT' },
  description: 'AI-powered 5G telecommunications specifications assistant by Capgemini. Expert answers from 3GPP, O-RAN, and ETSI standards.',
  keywords: ['5G', '3GPP', 'NR', 'O-RAN', 'telecommunications', 'specifications', 'AI', 'Capgemini'],
  openGraph: {
    title: '5G SpecGPT by Capgemini',
    description: 'Enterprise AI for 5G telecom specifications',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
