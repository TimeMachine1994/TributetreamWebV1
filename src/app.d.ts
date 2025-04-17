// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      authenticated: boolean;
      user: {
        id: number;
        email: string;
        display_name: string;
        roles?: string[];
        avatar_url?: string;
      } | null;
      token: string | null;
    }
    // interface PageData {}
    // interface Platform {}
  }
}

export {};
