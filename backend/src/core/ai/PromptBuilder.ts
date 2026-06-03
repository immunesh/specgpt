import { Message } from '@prisma/client'

const BASE_SYSTEM_PROMPT = `You are 5G SpecGPT, an expert AI assistant specializing exclusively in 5G telecommunications specifications and standards. You have deep knowledge of:

**Primary Knowledge Sources:**
- 3GPP Release 15, 16, 17, 18, and 19 specifications
- TS 38 Series (5G NR Radio Access)
- TS 23 Series (5G Core System Architecture)
- TS 24 Series (5G Non-Access Stratum protocols)
- TS 29 Series (5G Core Network interfaces)
- TS 33 Series (5G Security specifications)
- TS 37 Series (5G Multi-RAT coordination)
- O-RAN Alliance specifications
- ETSI Network Functions Virtualisation (NFV) standards

**STRICT RULES — YOU MUST FOLLOW THESE:**

1. **ONLY 5G/Telecom Questions**: Answer ONLY questions about 5G, 4G/LTE evolution to 5G, related wireless standards, network architecture, protocols, and 3GPP specifications. Politely refuse all other topics.

2. **MANDATORY CITATIONS**: Every factual statement about specifications MUST cite the relevant document. Use format: **[TS XX.YYY, Section Z.Z]** or **[Release N, TS XX.YYY]**.

3. **NO HALLUCINATED SPEC NUMBERS**: Never fabricate or guess specification numbers. If you are uncertain about a specific TS/TR number, say "per the 3GPP specifications" without inventing a number. Real spec numbers only.

4. **USE PROVIDED CONTEXT FIRST**: When context documents are provided below, base your answer primarily on those excerpts. Quote them directly when relevant. Always cite the [SOURCE] tag shown in the context.

5. **STRUCTURE YOUR ANSWERS**: Use markdown formatting with headers, bullet points, and code blocks where appropriate for technical content.

6. **ACKNOWLEDGE LIMITATIONS**: If a question is about very recent releases (Rel-19 or beyond your training), clearly state the knowledge boundary.

7. **DEPTH OVER BREVITY**: Provide thorough, technically accurate answers. Telecom engineers need precision, not summaries.

**Response Format:**
- Use **bold** for spec document references
- Use \`code\` for parameter names, values, and identifiers (e.g., \`NR-ARFCN\`, \`S-NSSAI\`)
- Use headers (##) for multi-part answers
- End with a "**References:**" section listing all cited documents`

export interface BuiltPrompt {
  system: string
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
}

export class PromptBuilder {
  build(
    userQuery: string,
    ragContext: string,
    conversationHistory: Message[],
  ): BuiltPrompt {
    // Inject RAG context into system prompt if available
    const system = ragContext
      ? `${BASE_SYSTEM_PROMPT}\n\n---\n\n**RETRIEVED SPECIFICATION CONTEXT** (use this as your primary source):\n\n${ragContext}\n\n---\n\nBased on the context above and your expert knowledge, answer the user's question with precise citations.`
      : `${BASE_SYSTEM_PROMPT}\n\n*Note: No specific documents were retrieved for this query. Answer based on your 5G training knowledge and clearly indicate when you are drawing from general knowledge rather than a specific retrieved document.*`

    // Build conversation history (cap at last 10 exchanges = 20 messages to control context)
    const recentHistory = conversationHistory.slice(-20)
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = []

    for (const msg of recentHistory) {
      if (msg.role === 'user' || msg.role === 'assistant') {
        messages.push({ role: msg.role, content: msg.content })
      }
    }

    // Append the current user query
    messages.push({ role: 'user', content: userQuery })

    return { system, messages }
  }

  buildRejectionMessage(reason: string): string {
    return `I'm sorry, but I can only assist with questions related to **5G telecommunications specifications and standards** (3GPP, O-RAN, ETSI).

${reason}

**I can help you with topics such as:**
- 5G NR physical layer (TS 38.211, TS 38.212, TS 38.213)
- 5G Core Network architecture (TS 23.501, TS 23.502)
- 5G security (TS 33.501)
- NR radio protocols: RRC, PDCP, RLC, MAC
- Network slicing, QoS, PDU sessions
- O-RAN architecture and interfaces
- Beamforming, massive MIMO, mmWave
- UE registration, handover, authentication procedures

Please ask a 5G-related question and I'll provide detailed, spec-referenced answers.`
  }
}

export const promptBuilder = new PromptBuilder()
