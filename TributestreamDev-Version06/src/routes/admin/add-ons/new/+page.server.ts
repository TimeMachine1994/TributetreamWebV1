import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const actions: Actions = {
  default: async ({ request, fetch }) => {
    const formData = await request.formData();
    
    const addOnTitle = formData.get('addOnTitle')?.toString();
    const addOnDescription = formData.get('addOnDescription')?.toString();
    const addOnPrice = formData.get('addOnPrice') ? 
      parseFloat(formData.get('addOnPrice')?.toString() || '0') : 
      null;

    console.log('📝 Creating add-on:', { addOnTitle, addOnDescription, addOnPrice });

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
      const response = await fetch('/api/add-ons', {
        method: 'POST',
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
          error: 'Failed to create add-on',
          values: { addOnTitle, addOnDescription, addOnPrice }
        });
      }

      const result = await response.json();
      console.log('✅ Add-on created successfully:', result);

      throw redirect(303, '/admin/add-ons');
    } catch (err) {
      if (err instanceof Response) throw err;
      
      console.error('❌ Error creating add-on:', err);
      return fail(500, {
        error: 'Internal server error',
        values: { addOnTitle, addOnDescription, addOnPrice }
      });
    }
  }
};