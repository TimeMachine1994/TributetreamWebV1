import { fail, redirect } from '@sveltejs/kit';
import tributesService from '$lib/api/services/tributes.service';
import type { TributeInput } from '$lib/types/strapi.types';

/**
 * Types for page data
 */
interface PageData {
  tributes: any[];
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
  user: any;
  error?: string;
}

/**
 * Server load function for tributes page
 */
export async function load({ locals, url }: { locals: Record<string, any>; url: URL }): Promise<PageData> {
  // Get pagination params
  const page = parseInt(url.searchParams.get('page') || '1');
  const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
  
  try {
    // Fetch tributes from Strapi
    const tributesResponse = await tributesService.getAll(page, pageSize);
    
    const defaultPagination = {
      page: 1,
      pageSize: 10,
      pageCount: 0,
      total: 0
    };
    
    return {
      tributes: tributesResponse.data || [],
      pagination: tributesResponse.meta?.pagination || defaultPagination,
      user: locals.user
    };
  } catch (error) {
    console.error('Error loading tributes:', error);
    return {
      tributes: [],
      pagination: {
        page: 1,
        pageSize: 10,
        pageCount: 0,
        total: 0
      },
      user: locals.user,
      error: error instanceof Error ? error.message : 'Failed to load tributes'
    };
  }
}

/**
 * Actions for the tributes page
 */
export const actions = {
  /**
   * Create a new tribute
   */
  create: async ({ request, locals }: { request: Request; locals: Record<string, any> }) => {
    // Check if user is authenticated
    if (!locals.user) {
      return fail(401, { success: false, message: 'You must be logged in to create a tribute' });
    }
    
    const formData = await request.formData();
    const lovedOnesFullName = formData.get('lovedOnesFullName')?.toString();
    const lovedOnesDOB = formData.get('lovedOnesDOB')?.toString();
    const dateOfPassing = formData.get('dateOfPassing')?.toString();
    
    // Validate required fields
    if (!lovedOnesFullName) {
      return fail(400, { 
        success: false, 
        message: 'Loved one\'s full name is required',
        fields: { lovedOnesFullName, lovedOnesDOB, dateOfPassing }
      });
    }
    
    // Create tribute data
    const tributeData: TributeInput = {
      lovedOnesFullName,
      owner: { id: locals.user.id }
    };
    
    if (lovedOnesDOB) tributeData.lovedOnesDOB = lovedOnesDOB;
    if (dateOfPassing) tributeData.dateOfPassing = dateOfPassing;
    
    try {
      // Create tribute
      const result = await tributesService.create(tributeData);
      
      if (result.data) {
        // Redirect to the new tribute page
        throw redirect(303, `/tributes/${result.data.id}`);
      }
      
      return {
        success: true,
        tribute: result.data
      };
    } catch (error) {
      console.error('Error creating tribute:', error);
      
      return fail(500, {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create tribute',
        fields: { lovedOnesFullName, lovedOnesDOB, dateOfPassing }
      });
    }
  }
};