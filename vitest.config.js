import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node', // for API tests
    include: ['tests/**/*.test.ts', 'server/__tests__/**/*.spec.ts'],
    test: {
      globals: true,
      environment: 'jsdom',
    },
  },
});
