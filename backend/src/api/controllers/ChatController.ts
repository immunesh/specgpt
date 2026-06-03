import { Request, Response, NextFunction } from 'express'
import { chatService } from '@/domain/services/ChatService'
import { conversationService } from '@/domain/services/ConversationService'
import { semanticSearchService } from '@/core/search/SemanticSearchService'
import {
  SendMessageInput,
  ListConversationsInput,
  UpdateConversationInput,
  SearchInput,
} from '@/api/validators/chatValidators'

export class ChatController {
  // POST /chat — unified streaming + non-streaming entry point
  async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { message, conversationId, stream } = req.body as SendMessageInput
      const userId = req.user!.id

      if (stream !== false) {
        // SSE streaming response
        res.setHeader('Content-Type', 'text/event-stream')
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('Connection', 'keep-alive')
        res.setHeader('X-Accel-Buffering', 'no') // nginx: disable buffering
        res.flushHeaders()

        await chatService.chatStream({ userId, conversationId, message }, res)
      } else {
        // Standard JSON response
        const result = await chatService.chat({ userId, conversationId, message })
        res.json({ success: true, data: result })
      }
    } catch (err) {
      next(err)
    }
  }

  // GET /conversations
  async listConversations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as ListConversationsInput
      const result = await conversationService.list(req.user!.id, {
        page: Number(query.page) || 1,
        limit: Math.min(Number(query.limit) || 20, 100),
        archived: query.archived as unknown as boolean,
      })
      res.json({
        success: true,
        data: result.conversations,
        meta: { total: result.total, totalPages: result.totalPages },
      })
    } catch (err) {
      next(err)
    }
  }

  // GET /conversations/:id/messages
  async getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = Number(req.query.limit) || 50
      const messages = await conversationService.getMessages(
        req.params.id,
        req.user!.id,
        Math.min(limit, 200),
      )
      res.json({ success: true, data: messages })
    } catch (err) {
      next(err)
    }
  }

  // PATCH /conversations/:id
  async updateConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = req.body as UpdateConversationInput
      const { id } = req.params
      const userId = req.user!.id

      if (body.title !== undefined) {
        await conversationService.updateTitle(id, userId, body.title)
      }
      if (body.isPinned !== undefined) {
        await conversationService.pin(id, userId, body.isPinned)
      }

      res.json({ success: true, message: 'Conversation updated' })
    } catch (err) {
      next(err)
    }
  }

  // POST /conversations/:id/archive
  async archiveConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await conversationService.archive(req.params.id, req.user!.id)
      res.json({ success: true, message: 'Conversation archived' })
    } catch (err) {
      next(err)
    }
  }

  // DELETE /conversations/:id
  async deleteConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await conversationService.delete(req.params.id, req.user!.id)
      res.json({ success: true, message: 'Conversation deleted' })
    } catch (err) {
      next(err)
    }
  }

  // GET /conversations/:id/export
  async exportConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const markdown = await conversationService.export(req.params.id, req.user!.id)
      res.setHeader('Content-Type', 'text/markdown; charset=utf-8')
      res.setHeader('Content-Disposition', `attachment; filename="conversation-${req.params.id}.md"`)
      res.send(markdown)
    } catch (err) {
      next(err)
    }
  }

  // GET /search
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as SearchInput
      const results = await semanticSearchService.search({
        query: query.q as string,
        limit: Number(query.limit) || 10,
        minScore: Number(query.minScore) || 0.3,
      })
      res.json({ success: true, data: results })
    } catch (err) {
      next(err)
    }
  }
}

export const chatController = new ChatController()
