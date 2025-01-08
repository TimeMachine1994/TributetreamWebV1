// app.d.ts
declare global {
    namespace App {
      interface Locals {
        jwt?: string;
      }
 

      interface Tribute {
        id: string;
        user_id: string;
        loved_one_name: string;
        slug: string;
        created_at: string; // Use ISO strings or standard date formats if possible
        updated_at: string;
        custom_html: string | null;
        phone_number: string;
        number_of_streams: number | null;
      }
  

    }
  }
  
  export {};
  