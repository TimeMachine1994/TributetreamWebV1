import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock SvelteKit's environment
vi.mock('$app/environment', () => ({
  browser: true,
  dev: true,
  building: false
}));

// Mock SvelteKit's navigation
vi.mock('$app/navigation', () => ({
  goto: vi.fn(),
  invalidate: vi.fn()
}));

// Mock SvelteKit's stores
vi.mock('$app/stores', () => {
  const getStores = vi.fn(() => ({
    page: {
      subscribe: vi.fn()
    },
    navigating: {
      subscribe: vi.fn()
    },
    updated: {
      subscribe: vi.fn()
    }
  }));

  return {
    getStores,
    page: {
      subscribe: vi.fn()
    },
    navigating: {
      subscribe: vi.fn()
    },
    updated: {
      subscribe: vi.fn()
    }
  };
});

// Global setup
global.fetch = vi.fn();