import { error } from '@sveltejs/kit';
import packagesService from '$lib/api/services/packages.service';

/**
 * Types for page data
 */
interface PageData {
  package: any;
  tributes?: any[];
  error?: string;
}

/**
 * Server load function for package detail page
 */
export async function load({ params }: { params: { id: string } }): Promise<PageData> {
  const { id } = params;
  
  if (!id || isNaN(parseInt(id))) {
    throw error(400, 'Invalid package ID');
  }
  
  try {
    // Fetch package with related tributes
    const packageResponse = await packagesService.getWithTributes(parseInt(id));
    
    if (!packageResponse.data) {
      throw error(404, 'Package not found');
    }
    
    return {
      package: packageResponse.data,
      // Cast to any to access dynamically populated tributes
      tributes: (packageResponse.data.attributes as any).tributes?.data || []
    };
  } catch (err: any) {
    console.error('Error loading package:', err);
    
    // Check for specific error types and handle accordingly
    if (err.status === 404) {
      throw error(404, 'Package not found');
    }
    
    throw error(500, err instanceof Error ? err.message : 'Failed to load package');
  }
}