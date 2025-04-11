import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['**/*.d.ts', '**/*.test.ts', '**/*.spec.ts', '**/node_modules/**']
    },
    alias: {
      $lib: resolve('./src/lib'),
      $app: resolve('./node_modules/@sveltejs/kit/src/runtime/app')
    }
  }
});