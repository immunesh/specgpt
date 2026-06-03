'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { chatApi } from '@/lib/api/chat'
import { useChatStore } from '@/store/chatStore'

export function useConversations() {
  const qc = useQueryClient()
  const { setConversations, removeConversation, updateConversation } = useChatStore()

  const query = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await chatApi.listConversations({ limit: 50 })
      const convs = res.data.data ?? []
      const total = res.data.meta?.total ?? convs.length
      setConversations(convs, total)
      return convs
    },
    staleTime: 30_000,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => chatApi.deleteConversation(id),
    onSuccess: (_, id) => {
      removeConversation(id)
      qc.invalidateQueries({ queryKey: ['conversations'] })
      toast.success('Conversation deleted')
    },
    onError: () => toast.error('Failed to delete conversation'),
  })

  const renameMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      chatApi.updateConversation(id, { title }),
    onSuccess: (_, { id, title }) => {
      updateConversation(id, { title })
      qc.invalidateQueries({ queryKey: ['conversations'] })
    },
    onError: () => toast.error('Failed to rename conversation'),
  })

  const pinMutation = useMutation({
    mutationFn: ({ id, isPinned }: { id: string; isPinned: boolean }) =>
      chatApi.updateConversation(id, { isPinned }),
    onSuccess: (_, { id, isPinned }) => {
      updateConversation(id, { isPinned })
      qc.invalidateQueries({ queryKey: ['conversations'] })
    },
    onError: () => toast.error('Failed to pin conversation'),
  })

  const archiveMutation = useMutation({
    mutationFn: (id: string) => chatApi.archiveConversation(id),
    onSuccess: (_, id) => {
      removeConversation(id)
      qc.invalidateQueries({ queryKey: ['conversations'] })
      toast.success('Conversation archived')
    },
    onError: () => toast.error('Failed to archive conversation'),
  })

  const exportConversation = async (id: string, title: string) => {
    try {
      const res = await chatApi.exportConversation(id)
      const blob = new Blob([res.data as BlobPart], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title.slice(0, 50).replace(/[^a-z0-9]/gi, '-')}.md`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Failed to export conversation')
    }
  }

  return {
    isLoading: query.isLoading,
    refetch: query.refetch,
    deleteConversation: deleteMutation.mutate,
    renameConversation: renameMutation.mutate,
    pinConversation: pinMutation.mutate,
    archiveConversation: archiveMutation.mutate,
    exportConversation,
  }
}
