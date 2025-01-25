// app.d.ts
declare global {
    namespace App {
      interface Locals {}

      interface PageData {}

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
