// Runs before any test module is imported — satisfies config/index.ts validation
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.JWT_SECRET = 'test_jwt_secret_that_is_at_least_32_characters_long'
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_that_is_at_least_32_chars_long'
process.env.GROQ_API_KEY = 'test-groq-api-key'
