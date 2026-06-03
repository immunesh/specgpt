import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Authentication' }

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-brand flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">5G</span>
          </div>
          <span className="text-white font-bold text-xl">SpecGPT</span>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Your AI Expert for<br />5G Specifications
          </h1>
          <p className="text-white/80 text-lg leading-relaxed">
            Instant, citation-backed answers from 3GPP, O-RAN, and ETSI standards.
            Built for telecom engineers.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: '3GPP Releases', value: '15–18' },
              { label: 'TS Series', value: '38, 23, 29, 33' },
              { label: 'Standards', value: 'O-RAN, ETSI' },
              { label: 'AI Model', value: 'Claude' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/10 rounded-lg p-4">
                <div className="text-white/60 text-sm">{label}</div>
                <div className="text-white font-semibold">{value}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/50 text-sm">
          Powered by Anthropic Claude · 5G SpecGPT v1.0
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
