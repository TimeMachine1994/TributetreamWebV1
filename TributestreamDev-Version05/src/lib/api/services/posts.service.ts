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
    
    // Make the request
    // We need to use a custom approach to get the headers
    const url = apiClient.getFullUrl(this.endpoint, query.getParams());
    const response = await fetch(url, {
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
    const data = await response.json() as WPPost[];
    
    // Get the total items and total pages from the headers
    const totalItems = parseInt(response.headers.get('X-WP-Total') || '0', 10);
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '0', 10);
    
    // Return the paginated response
    return {
      data,
      total_items: totalItems,
      total_pages: totalPages,
      current_page: page
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
    
    // Make the request
    return apiClient.post<WPPost>(this.endpoint, postData);
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
    // Make the request
    return apiClient.put<WPPost>(`${this.endpoint}/${id}`, data);
  }
  
  /**
   * Delete a post
   * @param id Post ID
   * @param force Whether to force delete the post (bypass trash)
   * @returns Promise resolving to the deleted post
   */
  async deletePost(id: number, force: boolean = false): Promise<WPSuccessResponse<WPPost>> {
    // Make the request
    return apiClient.delete<WPSuccessResponse<WPPost>>(`${this.endpoint}/${id}`, {
      params: { force }
    });
  }
}

// Create and export a singleton instance
export const postsService = new PostsService();