// src/services/LivestreamService.ts

import { z } from 'zod';

const livestreamSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  date: z.date(),
});

export type LivestreamData = z.infer<typeof livestreamSchema>;

export class LivestreamService {
  private apiUrl = 'https://wp.tributestream.com/wp-json/custom/v1/livestreams';

  async createLivestream(data: LivestreamData): Promise<any> {
    console.log('Service called: createLivestream with data:', data);

    // Validate input data
    const validatedData = livestreamSchema.parse(data);
    console.log('Validated data:', validatedData);

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include auth token if required
        },
        body: JSON.stringify(validatedData),
      });

      console.log('API response status:', response.status);

      if (!response.ok) {
        console.error('API response error:', response.statusText);
        throw new Error(`Failed to create livestream: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('API response data:', result);

      return result;
    } catch (error) {
      console.error('Error in createLivestream:', error);
      throw error;
    }
  }

  // Implement other CRUD methods (read, update, delete) similarly
}
