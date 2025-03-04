import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

// Server-side load function to handle initial data loading
export const load: PageServerLoad = async ({ url, fetch }) => {
  const query = url.searchParams.get('q') || '';
  
  if (!query) {
    return {
      initialQuery: '',
      initialResults: []
    };
  }
  
  try {
    // Make API call to fetch tributes
    const response = await fetch(`/api/tributes?search=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching tributes: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      initialQuery: query,
      initialResults: data.tributes || [],
      totalPages: data.total_pages || 1,
      currentPage: data.current_page || 1
    };
  } catch (error) {
    console.error('Search error:', error);
    return {
      initialQuery: query,
      initialResults: [],
      error: 'Failed to load search results'
    };
  }
};

// Form actions for search
export const actions = {
  search: async ({ request, fetch }) => {
    const formData = await request.formData();
    const query = formData.get('query') as string;
    const page = parseInt(formData.get('page') as string || '1');
    
    if (!query) {
      return fail(400, { error: 'Search query is required' });
    }
    
    try {
      // Make API call to fetch tributes
      const response = await fetch(`/api/tributes?search=${encodeURIComponent(query)}&page=${page}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching tributes: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        success: true,
        query,
        page,
        data: {
          tributes: data.tributes || [],
          total_pages: data.total_pages || 1,
          current_page: page
        }
      };
    } catch (error) {
      console.error('Search action error:', error);
      return fail(500, { 
        error: true,
        message: 'Failed to search tributes'
      });
    }
  }
} satisfies Actions;