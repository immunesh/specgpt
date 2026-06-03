import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'
import { ValidationError } from '@/utils/errors'

type Target = 'body' | 'query' | 'params'

export function validate(schema: ZodSchema, target: Target = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[target])
      req[target] = parsed
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        const message = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ')
        next(new ValidationError(message, err.errors))
      } else {
        next(err)
      }
    }
  }
}
