import { superValidate, message } from 'sveltekit-superforms';
import { z } from 'zod';

// Define the schema
const livestreamSchema = z.object({
  event_name: z.string().min(1, 'Event name is required.'),
  event_address: z.string().optional(),
  event_date: z.string().min(1, 'Event date is required.'),
  description: z.string().optional()
});

export const load = async () => {
  // Initialize the form with the schema
  const form = await superValidate(livestreamSchema);

  // Return the form object for client use
  return { form };
};

export const actions = {
  default: async ({ request }) => {
    // Validate the form data
    const form = await superValidate(request, livestreamSchema);

    if (!form.valid) {
      // If validation fails, return the form with errors
      return { form };
    }

    // Perform your API call to save the data
    try {
      const response = await fetch('https://wp.tributestream.com/wp-json/custom/v1/tribute-pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form.data)
      });

      if (!response.ok) {
        return { form, error: 'Failed to save the livestream. Please try again.' };
      }

      // Return a success message
      return message(form, 'Livestream added successfully!');
    } catch (err) {
      return { form, error: 'An unexpected error occurred. Please try again later.' };
    }
  }
};
