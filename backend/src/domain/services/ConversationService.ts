import { Conversation } from '@prisma/client'
import { conversationRepository } from '@/core/container'
import { NotFoundError } from '@/utils/errors'
import { Message } from '@prisma/client'

export class ConversationService {
  async list(
    userId: string,
    params: { page: number; limit: number; archived?: boolean },
  ) {
    const { conversations, total } = await conversationRepository.findByUserId(userId, params)
    return {
      conversations,
      total,
      totalPages: Math.ceil(total / params.limit),
    }
  }

  async getMessages(
    conversationId: string,
    userId: string,
    limit = 50,
  ): Promise<Message[]> {
    return conversationRepository.getMessages(conversationId, userId, limit)
  }

  async updateTitle(
    id: string,
    userId: string,
    title: string,
  ): Promise<Conversation> {
    return conversationRepository.updateTitle(id, userId, title)
  }

  async archive(id: string, userId: string): Promise<Conversation> {
    return conversationRepository.archive(id, userId)
  }

  async pin(id: string, userId: string, pinned: boolean): Promise<Conversation> {
    return conversationRepository.pin(id, userId, pinned)
  }

  async delete(id: string, userId: string): Promise<void> {
    return conversationRepository.delete(id, userId)
  }

  // Export conversation as plain text / markdown
  async export(id: string, userId: string): Promise<string> {
    const messages = await conversationRepository.getMessages(id, userId, 200)
    if (messages.length === 0) throw new NotFoundError('Conversation')

    const lines: string[] = [
      '# 5G SpecGPT — Conversation Export',
      `**Exported:** ${new Date().toISOString()}`,
      `**Conversation ID:** ${id}`,
      '',
      '---',
      '',
    ]

    for (const msg of messages) {
      const role = msg.role === 'user' ? '**You**' : '**5G SpecGPT**'
      const time = msg.createdAt.toISOString().replace('T', ' ').slice(0, 19)
      lines.push(`### ${role} — ${time}`)
      lines.push('')
      lines.push(msg.content)
      lines.push('')

      // Append sources if present
      const sources = msg.sources as any[]
      if (sources?.length > 0) {
        lines.push('**Sources:**')
        sources.forEach((s) => {
          const ref = [s.specNumber, s.release ? `Rel-${s.release.replace('REL_', '')}` : ''].filter(Boolean).join(' ')
          lines.push(`- ${s.documentName}${ref ? ` (${ref})` : ''}`)
        })
        lines.push('')
      }

      lines.push('---')
      lines.push('')
    }

    return lines.join('\n')
  }
}

export const conversationService = new ConversationService()
