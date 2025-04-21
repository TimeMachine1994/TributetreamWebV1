import { error, fail } from '@sveltejs/kit';
import packagesService from '$lib/api/services/packages.service';
import type { PackageInput } from '$lib/types/strapi.types';

/**
 * Types for page data
 */
interface PageData {
  packages: any[];
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
  page: number;
  pageSize: number;
  error?: string;
}

/**
 * Server load function for packages page
 */
export async function load({ url }: { url: URL }): Promise<PageData> {
  const page = parseInt(url.searchParams.get('page') || '1');
  const pageSize = parseInt(url.searchParams.get('pageSize') || '10');

  try {
    const packagesResponse = await packagesService.getAll(page, pageSize);
    
    const defaultPagination = {
      page: 1,
      pageSize: 10,
      pageCount: 0,
      total: 0
    };
    
    return {
      packages: packagesResponse.data || [],
      pagination: packagesResponse.meta?.pagination || defaultPagination,
      page,
      pageSize
    };
  } catch (err: any) {
    console.error('Error loading packages:', err);
    throw error(500, 'Failed to load packages');
  }
}

/**
 * Actions for the packages page
 */
export const actions = {
  /**
   * Create a new package
   */
  create: async ({ request }: { request: Request }) => {
    const formData = await request.formData();
    
    const name = formData.get('name')?.toString() || '';
    const description = formData.get('description')?.toString() || '';
    const priceStr = formData.get('price')?.toString() || '0';
    const price = parseFloat(priceStr);
    
    // Extract features array from form data (comma separated)
    const featuresStr = formData.get('features')?.toString() || '';
    const features = featuresStr ? featuresStr.split(',').map((f: string) => f.trim()) : [];
    
    // Validation
    if (!name) {
      return fail(400, { name, error: true, message: 'Package name is required' });
    }
    
    if (isNaN(price) || price < 0) {
      return fail(400, { 
        name, description, features, 
        error: true, 
        message: 'Price must be a valid positive number' 
      });
    }
    
    const packageData: PackageInput = {
      name,
      description,
      price,
      features
    };
    
    try {
      const response = await packagesService.create(packageData);
      
      return {
        success: true,
        package: response.data
      };
    } catch (err: any) {
      console.error('Error creating package:', err);
      
      return fail(500, {
        name, description, price, features,
        error: true,
        message: 'Failed to create package'
      });
    }
  },
};