import { writable, derived } from 'svelte/store';
import type { WPPost, WPPaginatedResponse } from '$lib/types/wordpress.types';
import { postsService } from '$lib/api/services/posts.service';

/**
 * Posts store state interface
 */
interface PostsState {
  posts: WPPost[];
  currentPost: WPPost | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

/**
 * Initial posts store state
 */
const initialState: PostsState = {
  posts: [],
  currentPost: null,
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalItems: 0
  }
};

/**
 * Create the posts store
 */
function createPostsStore() {
  const { subscribe, set, update } = writable<PostsState>(initialState);
  
  /**
   * Fetch posts with pagination and filtering
   * @param page Page number (1-based)
   * @param perPage Number of items per page
   * @param options Additional query options
   */
  async function fetchPosts(
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
  ) {
    update(state => ({ ...state, isLoading: true, error: null }));
    
    try {
      const response = await postsService.getPosts(page, perPage, options);
      
      update(state => ({
        ...state,
        posts: response.data,
        isLoading: false,
        pagination: {
          currentPage: page,
          totalPages: response.total_pages,
          totalItems: response.total_items
        }
      }));
      
      return response;
    } catch (error) {
      update(state => ({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch posts'
      }));
      
      throw error;
    }
  }
  
  /**
   * Fetch a single post by ID
   * @param id Post ID
   */
  async function fetchPost(id: number) {
    update(state => ({ ...state, isLoading: true, error: null }));
    
    try {
      const post = await postsService.getPost(id);
      
      update(state => ({
        ...state,
        currentPost: post,
        isLoading: false
      }));
      
      return post;
    } catch (error) {
      update(state => ({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : `Failed to fetch post with ID ${id}`
      }));
      
      throw error;
    }
  }
  
  /**
   * Create a new post
   * @param data Post data
   */
  async function createPost(data: {
    title: string;
    content: string;
    excerpt?: string;
    status?: string;
    categories?: number[];
    tags?: number[];
    featured_media?: number;
  }) {
    update(state => ({ ...state, isLoading: true, error: null }));
    
    try {
      const post = await postsService.createPost(data);
      
      // Add the new post to the posts array
      update(state => ({
        ...state,
        posts: [post, ...state.posts],
        currentPost: post,
        isLoading: false
      }));
      
      return post;
    } catch (error) {
      update(state => ({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create post'
      }));
      
      throw error;
    }
  }
  
  /**
   * Update an existing post
   * @param id Post ID
   * @param data Post data to update
   */
  async function updatePost(
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
  ) {
    update(state => ({ ...state, isLoading: true, error: null }));
    
    try {
      const post = await postsService.updatePost(id, data);
      
      // Update the post in the posts array
      update(state => ({
        ...state,
        posts: state.posts.map(p => p.id === id ? post : p),
        currentPost: state.currentPost?.id === id ? post : state.currentPost,
        isLoading: false
      }));
      
      return post;
    } catch (error) {
      update(state => ({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : `Failed to update post with ID ${id}`
      }));
      
      throw error;
    }
  }
  
  /**
   * Delete a post
   * @param id Post ID
   * @param force Whether to force delete the post (bypass trash)
   */
  async function deletePost(id: number, force: boolean = false) {
    update(state => ({ ...state, isLoading: true, error: null }));
    
    try {
      const response = await postsService.deletePost(id, force);
      
      // Remove the post from the posts array
      update(state => ({
        ...state,
        posts: state.posts.filter(p => p.id !== id),
        currentPost: state.currentPost?.id === id ? null : state.currentPost,
        isLoading: false
      }));
      
      return response;
    } catch (error) {
      update(state => ({
        ...state,
        isLoading: false,
        error: error instanceof Error ? error.message : `Failed to delete post with ID ${id}`
      }));
      
      throw error;
    }
  }
  
  /**
   * Clear any posts errors
   */
  function clearError() {
    update(state => ({
      ...state,
      error: null
    }));
  }
  
  /**
   * Reset the store to its initial state
   */
  function reset() {
    set(initialState);
  }
  
  return {
    subscribe,
    fetchPosts,
    fetchPost,
    createPost,
    updatePost,
    deletePost,
    clearError,
    reset
  };
}

// Create and export the posts store
export const postsStore = createPostsStore();

// Derived stores for convenience
export const posts = derived(postsStore, $postsStore => $postsStore.posts);
export const currentPost = derived(postsStore, $postsStore => $postsStore.currentPost);
export const isLoading = derived(postsStore, $postsStore => $postsStore.isLoading);
export const postsError = derived(postsStore, $postsStore => $postsStore.error);
export const pagination = derived(postsStore, $postsStore => $postsStore.pagination);