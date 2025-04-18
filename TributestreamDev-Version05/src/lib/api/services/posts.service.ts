import { apiClient } from '../base-api.client';
import type { WPPost, WPPaginatedResponse, WPSuccessResponse } from '$lib/types/wordpress.types';
import { createQuery } from '../query-builder';

/**
 * Posts service for WordPress REST API
 * 
 * This service handles CRUD operations for WordPress posts.
 */
export class PostsService {
  private endpoint = 'posts';
  
  /**
   * Get all posts with pagination
   * @param page Page number (1-based)
   * @param perPage Number of items per page
   * @param options Additional query options
   * @returns Promise resolving to paginated posts
   */
  async getPosts(
    page: number = 1,
    perPage: number = 10,
    options: {
      search?: string;
      categories?: number[];
      tags?: number[];
      author?: number;
      orderBy?: keyof WPPost;
      order?: 'asc' | 'desc';
      status?: string;
    } = {}
  ): Promise<WPPaginatedResponse<WPPost>> {
    // Build the query using the query builder
    const query = createQuery<WPPost>()
      .page(page)
      .perPage(perPage);
    
    // Add search if provided
    if (options.search) {
      query.search(options.search);
    }
    
    // Add categories if provided
    if (options.categories && options.categories.length > 0) {
      query.filter('categories', options.categories.join(','));
    }
    
    // Add tags if provided
    if (options.tags && options.tags.length > 0) {
      query.filter('tags', options.tags.join(','));
    }
    
    // Add author if provided
    if (options.author) {
      query.byAuthor(options.author);
    }
    
    // Add order if provided
    if (options.orderBy) {
      query.orderBy(options.orderBy, options.order || 'desc');
    }
    
    // Add status if provided
    if (options.status) {
      query.byStatus(options.status);
    }
    
    // Make the request to the SvelteKit server endpoint
    const url = new URL('/api/posts', window.location.origin);
    
    // Add query parameters
    url.searchParams.set('page', page.toString());
    url.searchParams.set('per_page', perPage.toString());
    
    // Add search if provided
    if (options.search) {
      url.searchParams.set('search', options.search);
    }
    
    // Add categories if provided
    if (options.categories && options.categories.length > 0) {
      url.searchParams.set('categories', options.categories.join(','));
    }
    
    // Add tags if provided
    if (options.tags && options.tags.length > 0) {
      url.searchParams.set('tags', options.tags.join(','));
    }
    
    // Add author if provided
    if (options.author) {
      url.searchParams.set('author', options.author.toString());
    }
    
    // Add order if provided
    if (options.orderBy) {
      url.searchParams.set('orderby', options.orderBy.toString());
      if (options.order) {
        url.searchParams.set('order', options.order);
      }
    }
    
    // Add status if provided
    if (options.status) {
      url.searchParams.set('status', options.status);
    }
    
    // Make the request
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }
    
    // Parse the response
    const responseData = await response.json();
    
    if (!responseData.success) {
      throw new Error(responseData.message || 'Failed to fetch posts');
    }
    
    // Return the paginated response
    return {
      data: responseData.data,
      total_items: responseData.pagination.total_items,
      total_pages: responseData.pagination.total_pages,
      current_page: responseData.pagination.current_page
    };
  }
  
  /**
   * Get a single post by ID
   * @param id Post ID
   * @returns Promise resolving to the post
   */
  async getPost(id: number): Promise<WPPost> {
    return apiClient.get<WPPost>(`${this.endpoint}/${id}`);
  }
  
  /**
   * Create a new post
   * @param data Post data
   * @returns Promise resolving to the created post
   */
  async createPost(data: {
    title: string;
    content: string;
    excerpt?: string;
    status?: string;
    categories?: number[];
    tags?: number[];
    featured_media?: number;
  }): Promise<WPPost> {
    // Format the data for the WordPress REST API
    const postData = {
      title: data.title,
      content: data.content,
      excerpt: data.excerpt,
      status: data.status || 'draft',
      categories: data.categories,
      tags: data.tags,
      featured_media: data.featured_media
    };
    
    // Make the request to the SvelteKit server endpoint
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create post: ${response.statusText}`);
    }
    
    // Parse the response
    const responseData = await response.json();
    
    if (!responseData.success) {
      throw new Error(responseData.message || 'Failed to create post');
    }
    
    return responseData.data;
  }
  
  /**
   * Update an existing post
   * @param id Post ID
   * @param data Post data to update
   * @returns Promise resolving to the updated post
   */
  async updatePost(
    id: number,
    data: {
      title?: string;
      content?: string;
      excerpt?: string;
      status?: string;
      categories?: number[];
      tags?: number[];
      featured_media?: number;
    }
  ): Promise<WPPost> {
    // Make the request to the SvelteKit server endpoint
    const response = await fetch(`/api/posts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update post: ${response.statusText}`);
    }
    
    // Parse the response
    const responseData = await response.json();
    
    if (!responseData.success) {
      throw new Error(responseData.message || 'Failed to update post');
    }
    
    return responseData.data;
  }
  
  /**
   * Delete a post
   * @param id Post ID
   * @param force Whether to force delete the post (bypass trash)
   * @returns Promise resolving to the deleted post
   */
  async deletePost(id: number, force: boolean = false): Promise<WPSuccessResponse<WPPost>> {
    // Make the request to the SvelteKit server endpoint
    const url = new URL(`/api/posts/${id}`, window.location.origin);
    
    // Add force parameter if provided
    if (force) {
      url.searchParams.set('force', 'true');
    }
    
    // Make the request
    const response = await fetch(url.toString(), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete post: ${response.statusText}`);
    }
    
    // Parse the response
    const responseData = await response.json();
    
    if (!responseData.success) {
      throw new Error(responseData.message || 'Failed to delete post');
    }
    
    return responseData.data;
  }
}

// Create and export a singleton instance
export const postsService = new PostsService();