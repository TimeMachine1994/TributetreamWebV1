/// <reference types="@sveltejs/kit" />

declare global {
  namespace App {
    interface Locals {
      token?: string;
      isAuthenticated?: boolean;
      userId?: string;
      user?: {
        email: string;
        displayName: string;
        nicename: string;
      };
    }
  }
}

export {};
