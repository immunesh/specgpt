interface Props {
  onSelectPrompt: (prompt: string) => void
}

const STARTER_PROMPTS = [
  { label: '5G NR Architecture', prompt: 'Explain the overall 5G NR architecture and the key interfaces between gNB, AMF, and UPF per TS 38.300.' },
  { label: 'PDCCH & CORESET', prompt: 'What is CORESET and how does PDCCH scheduling work in 5G NR? Reference TS 38.211 and TS 38.213.' },
  { label: 'Network Slicing', prompt: 'How does network slicing work in 5GC? Explain S-NSSAI, NSSAI selection, and the role of NSSF per TS 23.501.' },
  { label: '5G Security (SUCI)', prompt: 'Explain SUPI concealment using SUCI and the AUSF authentication flow per TS 33.501.' },
  { label: 'AMF Registration', prompt: 'Walk me through the 5G NR initial registration procedure between UE and AMF, referencing TS 23.502.' },
  { label: 'FR1 vs FR2 Bands', prompt: 'What is the difference between FR1 and FR2 in 5G NR? What are the bandwidth limits and use cases per TS 38.101?' },
]

export function EmptyChat({ onSelectPrompt }: Props) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="w-20 h-20 gradient-brand rounded-3xl flex items-center justify-center mb-6 shadow-lg">
        <span className="text-white font-bold text-3xl">5G</span>
      </div>

      <h1 className="text-2xl font-bold mb-2">5G SpecGPT</h1>
      <p className="text-muted-foreground text-sm max-w-md mb-8">
        Expert AI for 3GPP, O-RAN, and ETSI specifications. Every answer cites the exact spec and section.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-2xl">
        {STARTER_PROMPTS.map(({ label, prompt }) => (
          <button
            key={label}
            onClick={() => onSelectPrompt(prompt)}
            className="text-left p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-accent transition-all group"
          >
            <p className="text-sm font-medium group-hover:text-primary transition-colors">{label}</p>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{prompt}</p>
          </button>
        ))}
      </div>

      <p className="text-[11px] text-muted-foreground mt-8">
        Knowledge base: 3GPP Rel-15 through Rel-18 · O-RAN · ETSI NFV
      </p>
    </div>
  )
}
