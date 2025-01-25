// app.d.ts
declare global {
    namespace App {
      interface User {
        id: string;
        email: string;
        name?: string;
        role: 'admin' | 'user';
      }

      interface Locals {
        user?: User;
        token?: string;
      }

      interface PageData {
        user?: User;
      }

      interface Tribute {
        id: string;
        loved_one_name: string;
        slug: string;
        created_at: string;
        updated_at: string;
        custom_html: string | null;
        phone_number: string;
        number_of_streams: number | null;
      }
    }
  }
  
  export {};
