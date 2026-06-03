import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@config': path.resolve(__dirname, './src/config'),
      '@api': path.resolve(__dirname, './src/api'),
      '@core': path.resolve(__dirname, './src/core'),
      '@domain': path.resolve(__dirname, './src/domain'),
      '@infrastructure': path.resolve(__dirname, './src/infrastructure'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
})
