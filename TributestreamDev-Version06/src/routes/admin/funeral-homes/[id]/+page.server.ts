import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load = (async ({ params, fetch }) => {
  console.log('🏠 Loading funeral home details:', params.id);
  
  const response = await fetch(`/api/funeral-homes/${params.id}`);
  
  if (!response.ok) {
    console.error('❌ Failed to fetch funeral home:', response.statusText);
    throw error(response.status, 'Failed to load funeral home');
  }

  const data = await response.json();
  console.log('✅ Loaded funeral home:', data);

  return {
    funeralHome: data.data
  };
}) satisfies PageServerLoad;

export const actions = {
  update: async ({ request, params, fetch }) => {
    const formData = await request.formData();
    
    const name = formData.get('name')?.toString();
    const address = formData.get('address')?.toString();

    console.log('🏠 Updating funeral home:', { id: params.id, name, address });

    if (!name || !address) {
      console.error('❌ Validation failed: Missing required fields');
      return fail(400, {
        error: 'Name and address are required',
        values: { name, address }
      });
    }

    const response = await fetch(`/api/funeral-homes/${params.id}`, {
      method: 'PUT',
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
      console.error('❌ Failed to update funeral home:', response.statusText);
      return fail(response.status, {
        error: 'Failed to update funeral home',
        values: { name, address }
      });
    }

    console.log('✅ Successfully updated funeral home');
    return { success: true };
  },

  delete: async ({ params, fetch }) => {
    console.log('🗑️ Deleting funeral home:', params.id);
    
    const response = await fetch(`/api/funeral-homes/${params.id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      console.error('❌ Failed to delete funeral home:', response.statusText);
      return fail(response.status, {
        error: 'Failed to delete funeral home'
      });
    }

    console.log('✅ Successfully deleted funeral home');
    throw redirect(303, '/admin/funeral-homes');
  }
} satisfies Actions;