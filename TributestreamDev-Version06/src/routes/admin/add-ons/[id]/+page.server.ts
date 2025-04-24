import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
  try {
    console.log('🔍 Fetching add-on:', params.id);
    const response = await fetch(`/api/add-ons/${params.id}`);
    
    if (!response.ok) {
      console.error('❌ Failed to fetch add-on:', response.status);
      throw error(response.status, 'Failed to fetch add-on');
    }
    
    const data = await response.json();
    console.log('✅ Successfully fetched add-on:', data);

    return {
      addOn: data.data
    };
  } catch (err) {
    console.error('❌ Error loading add-on:', err);
    throw error(500, 'Error loading add-on');
  }
};

export const actions: Actions = {
  update: async ({ request, params, fetch }) => {
    const formData = await request.formData();
    
    const addOnTitle = formData.get('addOnTitle')?.toString();
    const addOnDescription = formData.get('addOnDescription')?.toString();
    const addOnPrice = formData.get('addOnPrice') ? 
      parseFloat(formData.get('addOnPrice')?.toString() || '0') : 
      null;

    console.log('✏️ Updating add-on:', params.id, { addOnTitle, addOnDescription, addOnPrice });

    // Validation
    if (!addOnTitle) {
      console.log('❌ Validation failed: Title is required');
      return fail(400, {
        missing: true,
        values: { addOnTitle, addOnDescription, addOnPrice }
      });
    }

    if (addOnPrice === null || isNaN(addOnPrice)) {
      console.log('❌ Validation failed: Invalid price');
      return fail(400, {
        error: 'Please enter a valid price',
        values: { addOnTitle, addOnDescription, addOnPrice }
      });
    }

    try {
      const response = await fetch(`/api/add-ons/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            addOnTitle,
            addOnDescription,
            addOnPrice
          }
        })
      });

      if (!response.ok) {
        console.error('❌ API error:', response.status);
        return fail(response.status, {
          error: 'Failed to update add-on',
          values: { addOnTitle, addOnDescription, addOnPrice }
        });
      }

      const result = await response.json();
      console.log('✅ Add-on updated successfully:', result);

      throw redirect(303, '/admin/add-ons');
    } catch (err) {
      if (err instanceof Response) throw err;
      
      console.error('❌ Error updating add-on:', err);
      return fail(500, {
        error: 'Internal server error',
        values: { addOnTitle, addOnDescription, addOnPrice }
      });
    }
  },

  delete: async ({ params, fetch }) => {
    try {
      console.log('🗑️ Deleting add-on:', params.id);
      const response = await fetch(`/api/add-ons/${params.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        console.error('❌ Failed to delete add-on:', response.status);
        return fail(response.status, {
          error: 'Failed to delete add-on'
        });
      }

      console.log('✅ Add-on deleted successfully');
      throw redirect(303, '/admin/add-ons');
    } catch (err) {
      if (err instanceof Response) throw err;
      
      console.error('❌ Error deleting add-on:', err);
      return fail(500, {
        error: 'Internal server error'
      });
    }
  }
};