// app.d.ts
declare global {
  namespace App {
    interface Locals {
      jwt?: string;
      user_id?: string;
      user?: {
        id?: string;
        username: string;
        nicename: string;
        email: string;
        isAdmin: boolean;
      }
    }

}
}

export {};
