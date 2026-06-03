import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaClient, UserRole, DocumentStatus, SpecSeries, Release } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // ── Admin User ──────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@SpecGPT2024!', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@5gspecgpt.com' },
    update: {},
    create: {
      email: 'admin@5gspecgpt.com',
      name: '5G SpecGPT Admin',
      passwordHash: adminPassword,
      role: UserRole.SUPER_ADMIN,
      emailVerified: true,
    },
  })
  console.log(`Admin user: ${admin.email}`)

  // ── Demo User ───────────────────────────────────────────────────
  const demoPassword = await bcrypt.hash('Demo@SpecGPT2024!', 12)
  const demo = await prisma.user.upsert({
    where: { email: 'demo@5gspecgpt.com' },
    update: {},
    create: {
      email: 'demo@5gspecgpt.com',
      name: 'Demo Engineer',
      passwordHash: demoPassword,
      role: UserRole.USER,
      emailVerified: true,
    },
  })
  console.log(`Demo user: ${demo.email}`)

  // ── 5G Specification Catalog (metadata only — no actual PDFs) ───
  const specCatalog = [
    {
      name: '3GPP TS 38.211 — NR Physical Channels and Modulation',
      fileName: 'TS_38.211.pdf',
      filePath: '/catalog/TS_38.211.pdf',
      specNumber: 'TS 38.211',
      specTitle: 'NR; Physical channels and modulation',
      series: SpecSeries.TS_38,
      release: Release.REL_17,
      version: '17.3.0',
    },
    {
      name: '3GPP TS 38.212 — NR Multiplexing and Channel Coding',
      fileName: 'TS_38.212.pdf',
      filePath: '/catalog/TS_38.212.pdf',
      specNumber: 'TS 38.212',
      specTitle: 'NR; Multiplexing and channel coding',
      series: SpecSeries.TS_38,
      release: Release.REL_17,
      version: '17.3.0',
    },
    {
      name: '3GPP TS 38.213 — NR Physical Layer Procedures for Control',
      fileName: 'TS_38.213.pdf',
      filePath: '/catalog/TS_38.213.pdf',
      specNumber: 'TS 38.213',
      specTitle: 'NR; Physical layer procedures for control',
      series: SpecSeries.TS_38,
      release: Release.REL_17,
      version: '17.3.0',
    },
    {
      name: '3GPP TS 38.300 — NR Overall Description',
      fileName: 'TS_38.300.pdf',
      filePath: '/catalog/TS_38.300.pdf',
      specNumber: 'TS 38.300',
      specTitle: 'NR; NR and NG-RAN Overall description; Stage-2',
      series: SpecSeries.TS_38,
      release: Release.REL_17,
      version: '17.3.0',
    },
    {
      name: '3GPP TS 38.331 — NR Radio Resource Control',
      fileName: 'TS_38.331.pdf',
      filePath: '/catalog/TS_38.331.pdf',
      specNumber: 'TS 38.331',
      specTitle: 'NR; Radio Resource Control (RRC) protocol specification',
      series: SpecSeries.TS_38,
      release: Release.REL_17,
      version: '17.3.0',
    },
    {
      name: '3GPP TS 23.501 — 5G System Architecture',
      fileName: 'TS_23.501.pdf',
      filePath: '/catalog/TS_23.501.pdf',
      specNumber: 'TS 23.501',
      specTitle: 'System architecture for the 5G System (5GS)',
      series: SpecSeries.TS_23,
      release: Release.REL_17,
      version: '17.7.0',
    },
    {
      name: '3GPP TS 23.502 — 5G System Procedures',
      fileName: 'TS_23.502.pdf',
      filePath: '/catalog/TS_23.502.pdf',
      specNumber: 'TS 23.502',
      specTitle: 'Procedures for the 5G System (5GS)',
      series: SpecSeries.TS_23,
      release: Release.REL_17,
      version: '17.7.0',
    },
    {
      name: '3GPP TS 29.500 — 5G Core HTTP/2 Framework',
      fileName: 'TS_29.500.pdf',
      filePath: '/catalog/TS_29.500.pdf',
      specNumber: 'TS 29.500',
      specTitle: '5G System; Technical Realization of Service Based Architecture; Stage 3',
      series: SpecSeries.TS_29,
      release: Release.REL_17,
      version: '17.8.0',
    },
    {
      name: '3GPP TS 33.501 — 5G Security Architecture',
      fileName: 'TS_33.501.pdf',
      filePath: '/catalog/TS_33.501.pdf',
      specNumber: 'TS 33.501',
      specTitle: 'Security architecture and procedures for 5G System',
      series: SpecSeries.TS_33,
      release: Release.REL_17,
      version: '17.8.0',
    },
    {
      name: '3GPP TS 38.401 — NG-RAN Architecture Description',
      fileName: 'TS_38.401.pdf',
      filePath: '/catalog/TS_38.401.pdf',
      specNumber: 'TS 38.401',
      specTitle: 'NG-RAN; Architecture description',
      series: SpecSeries.TS_38,
      release: Release.REL_17,
      version: '17.3.0',
    },
  ]

  for (const spec of specCatalog) {
    await prisma.document.upsert({
      where: {
        id: (
          await prisma.document
            .findFirst({ where: { specNumber: spec.specNumber } })
            .then((d) => d?.id ?? 'nonexistent-id-placeholder')
        ),
      },
      update: {},
      create: {
        ...spec,
        fileSize: 0n,
        mimeType: 'application/pdf',
        status: DocumentStatus.PENDING,
        uploadedBy: admin.id,
      },
    })
  }
  console.log(`Seeded ${specCatalog.length} 5G specification records`)

  // ── Demo Conversation ───────────────────────────────────────────
  const existingConv = await prisma.conversation.findFirst({
    where: { userId: demo.id, title: 'Getting Started with 5G NR' },
  })

  if (!existingConv) {
    const conv = await prisma.conversation.create({
      data: {
        userId: demo.id,
        title: 'Getting Started with 5G NR',
        messages: {
          createMany: {
            data: [
              {
                role: 'user',
                content: 'What is the difference between FR1 and FR2 in 5G NR?',
              },
              {
                role: 'assistant',
                content: `In 5G NR, frequency ranges are divided into two main bands:

**FR1 (Frequency Range 1)** covers sub-6 GHz bands (410 MHz – 7125 MHz):
- Better coverage and building penetration
- Used for wide-area coverage deployments
- Supports bandwidths up to 100 MHz per carrier
- Defined in **3GPP TS 38.101-1**

**FR2 (Frequency Range 2)** covers mmWave bands (24250 MHz – 52600 MHz):
- Higher bandwidth capacity (up to 400 MHz per carrier)
- Shorter range, used for dense urban hotspots
- Requires beamforming (defined in **TS 38.214**)
- Defined in **3GPP TS 38.101-2**

Reference: **3GPP TS 38.300** Section 5.1, **3GPP TS 38.101-1**, **3GPP TS 38.101-2**`,
                sources: [
                  {
                    documentId: 'seed',
                    documentName: '3GPP TS 38.300',
                    specNumber: 'TS 38.300',
                    release: 'REL_17',
                    relevanceScore: 0.95,
                    excerpt: 'NR operates in frequency range FR1 (sub-6GHz) and FR2 (mmWave)...',
                  },
                ],
                tokenCount: 312,
                modelUsed: 'claude-sonnet-4-6',
              },
            ],
          },
        },
      },
    })
    console.log(`Demo conversation created: ${conv.id}`)
  }

  console.log('Seed complete.')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
