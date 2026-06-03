import { Router } from 'express'
import { chatController } from '@/api/controllers/ChatController'
import { authenticate, authenticateLite } from '@/api/middleware/authenticate'
import { chatRateLimiter } from '@/api/middleware/rateLimiter'
import { validate } from '@/api/middleware/validate'
import {
  sendMessageSchema,
  listConversationsSchema,
  updateConversationSchema,
  searchSchema,
} from '@/api/validators/chatValidators'

const router = Router()

// All routes require authentication
router.use(authenticate)

// ── Chat ─────────────────────────────────────────────────────────

// POST /chat — send a message (streaming or non-streaming)
router.post(
  '/',
  chatRateLimiter,
  validate(sendMessageSchema),
  chatController.sendMessage.bind(chatController),
)

// ── Conversations ─────────────────────────────────────────────────

// GET /chat/conversations
router.get(
  '/conversations',
  validate(listConversationsSchema, 'query'),
  chatController.listConversations.bind(chatController),
)

// GET /chat/conversations/:id/messages
router.get(
  '/conversations/:id/messages',
  chatController.getMessages.bind(chatController),
)

// PATCH /chat/conversations/:id
router.patch(
  '/conversations/:id',
  validate(updateConversationSchema),
  chatController.updateConversation.bind(chatController),
)

// POST /chat/conversations/:id/archive
router.post(
  '/conversations/:id/archive',
  chatController.archiveConversation.bind(chatController),
)

// DELETE /chat/conversations/:id
router.delete(
  '/conversations/:id',
  chatController.deleteConversation.bind(chatController),
)

// GET /chat/conversations/:id/export — download as Markdown
router.get(
  '/conversations/:id/export',
  chatController.exportConversation.bind(chatController),
)

// ── Semantic Search ───────────────────────────────────────────────

// GET /chat/search?q=...
router.get(
  '/search',
  validate(searchSchema, 'query'),
  chatController.search.bind(chatController),
)

export { router as chatRouter }
