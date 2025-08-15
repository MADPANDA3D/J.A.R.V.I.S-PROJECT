/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: false, // Disable globals to prevent 'it' leaking into production
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
    ],
    // Memory optimization for CI
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    // Timeout configurations - reduced for faster failure detection
    testTimeout: 30000, // 30s to account for JSDOM environment setup time in WSL
    hookTimeout: 10000,
    teardownTimeout: 5000, // Ensure cleanup doesn't hang
    // Force process exit after tests complete
    forceRerunTriggers: [],
    // Additional cleanup options
    coverage: {
      enabled: false, // Disable coverage by default to prevent hanging
    },
    // Reduce memory usage
    isolate: true,
    cache: false,
    // Clean up between tests
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
    // Limit concurrent tests to prevent memory issues
    maxConcurrency: 1,
    // Disable type checking during tests for speed
    typecheck: {
      enabled: false,
    },
    // Environment variables for test optimization
    env: {
      NODE_ENV: 'test',
      VITEST: 'true',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
