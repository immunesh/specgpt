import type { Metadata } from 'next'
import { ChatWindow } from '@/components/chat/ChatWindow'

export const metadata: Metadata = { title: 'Chat' }

interface Props { params: Promise<{ id: string }> }

export default async function ConversationPage({ params }: Props) {
  const { id } = await params
  return <ChatWindow conversationId={id} />
}
