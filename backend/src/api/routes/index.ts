import { Router } from 'express'
import { authRouter } from './authRoutes'
import { documentRouter } from './documentRoutes'
import { chatRouter } from './chatRoutes'
import { adminRouter } from './adminRoutes'

export function createApiRouter(): Router {
  const router = Router()

  // Module 3: Auth
  router.use('/auth', authRouter)

  // Module 4: Documents + RAG
  router.use('/documents', documentRouter)

  // Module 5: Chat + AI + Semantic Search
  router.use('/chat', chatRouter)

  // Module 8: Admin
  router.use('/admin', adminRouter)

  // Module 6 (Admin) — mounted in next module
  // router.use('/admin', adminRouter)

  // Module 7 (Search) — mounted in next module
  // router.use('/search', searchRouter)

  router.get('/', (_req, res) => {
    res.json({
      success: true,
      data: {
        name: '5G SpecGPT API',
        version: '1.0.0',
        description: 'AI-powered 5G specifications assistant',
      },
    })
  })

  return router
}
