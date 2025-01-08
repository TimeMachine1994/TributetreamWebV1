import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types'; 
 
export const load: PageServerLoad = async ({ params }) => {
  const response = await fetch('/api/user');
  const data = await response.json();
  return { data };
};

export const actions = {

    submit_create: async ({ request }) => {
      
      //START Generate random password
      const formData = await request.formData();
          const length = 12; // Password length
          const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
          let password = "";
          
          for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
          }
          
      //END Generate random password
  
      const response = await fetch('/api/register', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                formData: Object.fromEntries(formData),
                password: password
              })
            });
      
            const result = await response.json();
            
            if (result.success) {
              const user_id = result.user_id;
              return { success: true, user_id, password };
            }
      
            return { success: false };      
      
  
    }
  } satisfies Actions;