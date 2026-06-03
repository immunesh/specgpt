// Dependency Injection Container (simple singleton pattern)
import {
  UserRepository,
  ConversationRepository,
  DocumentRepository,
  AnalyticsRepository,
} from '@/infrastructure/database/repositories'

// Repositories (singletons)
export const userRepository = new UserRepository()
export const conversationRepository = new ConversationRepository()
export const documentRepository = new DocumentRepository()
export const analyticsRepository = new AnalyticsRepository()

// Services are imported directly from their modules to avoid circular deps
// e.g. import { chatService } from '@/domain/services/ChatService'
