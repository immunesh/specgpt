import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Providers } from '@/components/shared/Providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
})

export const metadata: Metadata = {
  title: { default: '5G SpecGPT', template: '%s | 5G SpecGPT' },
  description: 'AI-powered 5G telecommunications specifications assistant. Expert answers from 3GPP, O-RAN, and ETSI standards.',
  keywords: ['5G', '3GPP', 'NR', 'O-RAN', 'telecommunications', 'specifications', 'AI'],
  openGraph: {
    title: '5G SpecGPT',
    description: 'Expert AI for 5G telecom specifications',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
