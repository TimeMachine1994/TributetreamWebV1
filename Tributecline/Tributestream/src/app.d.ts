// See https://kit.svelte.dev/docs/types#app
import type { WordPressUser } from '$lib/utils/api.client';

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WORDPRESS_URL: string
  readonly VITE_WP_API_NAMESPACE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      user?: WordPressUser;
      userId?: string;
      token?: string;
      isAuthenticated: boolean;
      role?: 'subscriber' | 'administrator' | string;
      calculatorStatus?: {
        completed: boolean;
        [key: string]: unknown;
      };
    }
    // interface PageData {}
    // interface Platform {}
  }

  // Extend WordPressUser type to include roles
  interface WordPressUser {
    roles?: string[];
  }
}

// THIS IS IMPORTANT!!!
export {};
