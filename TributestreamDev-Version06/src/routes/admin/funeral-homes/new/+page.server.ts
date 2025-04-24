import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
  default: async ({ request, fetch }) => {
    const formData = await request.formData();
    
    const name = formData.get('name')?.toString();
    const address = formData.get('address')?.toString();

    console.log('🏠 Creating new funeral home:', { name, address });

    if (!name || !address) {
      console.error('❌ Validation failed: Missing required fields');
      return fail(400, {
        error: 'Name and address are required',
        values: { name, address }
      });
    }

    const response = await fetch('/api/funeral-homes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: {
          Name: name,
          Address: address
        }
      })
    });

    if (!response.ok) {
      console.error('❌ Failed to create funeral home:', response.statusText);
      return fail(response.status, {
        error: 'Failed to create funeral home',
        values: { name, address }
      });
    }

    console.log('✅ Successfully created funeral home');
    throw redirect(303, '/admin/funeral-homes');
  }
} satisfies Actions;