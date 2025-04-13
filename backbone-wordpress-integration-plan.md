# Plan: Integrating Backbone.js with SvelteKit for WordPress REST API Interaction

Based on our discussion and the existing code in your project, I've outlined a comprehensive plan to integrate Backbone.js with your SvelteKit application to interact with your WordPress REST API. This plan will leverage your existing API proxy endpoints in `TributestreamDev-Version03/src/routes/api` rather than duplicating them.

## Overview

```mermaid
graph TD
    A[SvelteKit Frontend] -->|Backbone.js Models| B[Existing SvelteKit API Proxy]
    B -->|JWT Auth| C[WordPress REST API]
    C -->|JSON Response| B
    B -->|JSON Response| A
    
    subgraph "SvelteKit Application"
        A
        D[Backbone.js Models]
        E[Backbone.js Collections]
        F[SvelteKit Components]
    end
    
    subgraph "Existing API Proxy"
        B
        G[/api/auth]
        H[/api/tributes]
        I[/api/tributes/[id]]
        J[/api/tributes/by-slug/[slug]]
    end
    
    subgraph "WordPress"
        C
        K[Posts]
        L[Pages]
        M[Custom Post Type: Tributes]
    end
    
    D -->|Sync| B
    E -->|Fetch| B
    F -->|Use| D
    F -->|Use| E
```

## Implementation Plan

### 1. Set Up Dependencies

First, we'll need to install the necessary dependencies:

```bash
npm install backbone underscore jwt-decode
npm install --save-dev @types/backbone @types/underscore @types/jwt-decode
```

### 2. Create Type Definitions

Create TypeScript interfaces for the data structures we'll be working with:

```typescript
// src/lib/types/wp-models.ts
export interface WPEntity {
  id: number;
  date?: string;
  modified?: string;
  slug?: string;
  status?: string;
  link?: string;
}

export interface Post extends WPEntity {
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt?: {
    rendered: string;
  };
  author: number;
  featured_media?: number;
  categories?: number[];
  tags?: number[];
}

export interface Page extends WPEntity {
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  parent?: number;
  menu_order?: number;
  template?: string;
}

export interface Tribute extends WPEntity {
  user_id: number;
  loved_one_name: string;
  phone_number: string;
  custom_html?: string;
  number_of_streams?: number;
  extended_data?: Record<string, any>;
}

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  roles: string[];
  capabilities: Record<string, boolean>;
}

export interface AuthResponse {
  token: string;
  user_id: number;
  user_display_name: string;
  user_email: string;
  user_nicename: string;
  roles: string[];
  capabilities: Record<string, boolean>;
  meta_result: any;
}
```

### 3. Create Backbone.js Models and Collections

Create Backbone.js models and collections that work with your existing API endpoints:

```typescript
// src/lib/models/wp-backbone.ts
import Backbone from 'backbone';
import type { Post, Page, Tribute, User, AuthResponse } from '$lib/types/wp-models';

// Base model for WordPress entities
export const WPModel = Backbone.Model.extend({
  idAttribute: 'id',
  
  sync(method, model, options) {
    // Get the JWT token from localStorage
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('wp_token') : null;
    
    // Add the token to the request headers
    if (token) {
      options.headers = options.headers || {};
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Call the original sync method with our modified options
    return Backbone.sync.call(this, method, model, options);
  }
});

// Post model
export const PostModel = WPModel.extend({
  urlRoot: '/api/wp/posts',
  
  defaults: {
    title: { rendered: '' },
    content: { rendered: '' },
    excerpt: { rendered: '' },
    status: 'draft'
  },
  
  // Parse the response from WordPress
  parse(response: Post) {
    // Return the response as is, since we're using the existing API proxy
    return response;
  }
});

// Page model
export const PageModel = WPModel.extend({
  urlRoot: '/api/wp/pages',
  
  defaults: {
    title: { rendered: '' },
    content: { rendered: '' },
    status: 'draft'
  },
  
  // Parse the response from WordPress
  parse(response: Page) {
    // Return the response as is, since we're using the existing API proxy
    return response;
  }
});

// Tribute model (custom post type)
export const TributeModel = WPModel.extend({
  urlRoot: '/api/tributes',
  
  defaults: {
    user_id: 0,
    loved_one_name: '',
    phone_number: '',
    status: 'draft',
    custom_html: '',
    number_of_streams: 0
  }
});

// User model
export const UserModel = WPModel.extend({
  urlRoot: '/api/wp/users',
  
  defaults: {
    username: '',
    name: '',
    email: '',
    roles: [],
    capabilities: {}
  }
});

// Base collection for WordPress entities
export const WPCollection = Backbone.Collection.extend({
  sync(method, collection, options) {
    // Get the JWT token from localStorage
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('wp_token') : null;
    
    // Add the token to the request headers
    if (token) {
      options.headers = options.headers || {};
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Call the original sync method with our modified options
    return Backbone.sync.call(this, method, collection, options);
  }
});

// Posts collection
export const PostsCollection = WPCollection.extend({
  model: PostModel,
  url: '/api/wp/posts'
});

// Pages collection
export const PagesCollection = WPCollection.extend({
  model: PageModel,
  url: '/api/wp/pages'
});

// Tributes collection
export const TributesCollection = WPCollection.extend({
  model: TributeModel,
  url: '/api/tributes'
});

// Users collection
export const UsersCollection = WPCollection.extend({
  model: UserModel,
  url: '/api/wp/users'
});
```

### 4. Create Authentication Service

Create a service to handle authentication with your existing API:

```typescript
// src/lib/services/auth-service.ts
import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import jwtDecode from 'jwt-decode';
import type { AuthResponse } from '$lib/types/wp-models';

// Helper function to check if a token is valid
function isValidToken(token: string): boolean {
  if (!token) return false;
  
  try {
    const decoded: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    return decoded.exp > currentTime;
  } catch (error) {
    return false;
  }
}

// Helper function to get user info from a token
function getUserFromToken(token: string): any {
  if (!token) return null;
  
  try {
    return jwtDecode(token);
  } catch (error) {
    return null;
  }
}

// Create the auth store
function createAuthStore() {
  // Get the token from localStorage if we're in the browser
  const initialToken = browser ? localStorage.getItem('wp_token') : null;
  const initialUser = initialToken && isValidToken(initialToken) ? getUserFromToken(initialToken) : null;
  
  const { subscribe, set, update } = writable({
    token: initialToken,
    user: initialUser,
    isAuthenticated: !!initialUser
  });
  
  return {
    subscribe,
    
    // Login action
    login: async (username: string, password: string) => {
      try {
        const response = await fetch('/api/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });
        
        const data: AuthResponse = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Login failed');
        }
        
        // Store the token in localStorage
        if (browser) {
          localStorage.setItem('wp_token', data.token);
        }
        
        // Update the store
        set({
          token: data.token,
          user: {
            id: data.user_id,
            display_name: data.user_display_name,
            email: data.user_email,
            nicename: data.user_nicename,
            roles: data.roles,
            capabilities: data.capabilities
          },
          isAuthenticated: true
        });
        
        return true;
      } catch (error) {
        console.error('Login error:', error);
        return false;
      }
    },
    
    // Logout action
    logout: () => {
      // Remove the token from localStorage
      if (browser) {
        localStorage.removeItem('wp_token');
      }
      
      // Update the store
      set({
        token: null,
        user: null,
        isAuthenticated: false
      });
    },
    
    // Check if the token is still valid
    checkAuth: () => {
      if (!browser) return false;
      
      const token = localStorage.getItem('wp_token');
      
      if (token && isValidToken(token)) {
        const user = getUserFromToken(token);
        
        update(state => ({
          ...state,
          token,
          user,
          isAuthenticated: true
        }));
        
        return true;
      } else {
        // Token is invalid, clear it
        localStorage.removeItem('wp_token');
        
        update(state => ({
          ...state,
          token: null,
          user: null,
          isAuthenticated: false
        }));
        
        return false;
      }
    }
  };
}

export const authStore = createAuthStore();
```

### 5. Create Backbone.js Service for SvelteKit Components

Create a service to use Backbone.js models and collections in SvelteKit components:

```typescript
// src/lib/services/wp-backbone-service.ts
import Backbone from 'backbone';
import { get } from 'svelte/store';
import { authStore } from './auth-service';
import {
  PostModel,
  PageModel,
  TributeModel,
  PostsCollection,
  PagesCollection,
  TributesCollection
} from '$lib/models/wp-backbone';

// Initialize Backbone.js
export function initializeBackbone() {
  // Override Backbone.sync to use SvelteKit fetch
  const originalSync = Backbone.sync;
  
  Backbone.sync = function(method, model, options) {
    const auth = get(authStore);
    
    // Add the JWT token to the request headers
    if (auth.token) {
      options.headers = options.headers || {};
      options.headers['Authorization'] = `Bearer ${auth.token}`;
    }
    
    return originalSync.call(this, method, model, options);
  };
}

// Service for working with WordPress posts
export const postService = {
  // Get a single post
  getPost: async (id: number) => {
    const post = new PostModel({ id });
    await post.fetch();
    return post.toJSON();
  },
  
  // Get all posts
  getPosts: async (params = {}) => {
    const posts = new PostsCollection();
    await posts.fetch({ data: params });
    return posts.toJSON();
  },
  
  // Create a new post
  createPost: async (postData: any) => {
    const post = new PostModel(postData);
    await post.save();
    return post.toJSON();
  },
  
  // Update an existing post
  updatePost: async (id: number, postData: any) => {
    const post = new PostModel({ id, ...postData });
    await post.save();
    return post.toJSON();
  },
  
  // Delete a post
  deletePost: async (id: number) => {
    const post = new PostModel({ id });
    await post.destroy();
    return true;
  }
};

// Service for working with WordPress pages
export const pageService = {
  // Get a single page
  getPage: async (id: number) => {
    const page = new PageModel({ id });
    await page.fetch();
    return page.toJSON();
  },
  
  // Get all pages
  getPages: async (params = {}) => {
    const pages = new PagesCollection();
    await pages.fetch({ data: params });
    return pages.toJSON();
  },
  
  // Create a new page
  createPage: async (pageData: any) => {
    const page = new PageModel(pageData);
    await page.save();
    return page.toJSON();
  },
  
  // Update an existing page
  updatePage: async (id: number, pageData: any) => {
    const page = new PageModel({ id, ...pageData });
    await page.save();
    return page.toJSON();
  },
  
  // Delete a page
  deletePage: async (id: number) => {
    const page = new PageModel({ id });
    await page.destroy();
    return true;
  }
};

// Service for working with tributes
export const tributeService = {
  // Get a single tribute
  getTribute: async (id: number) => {
    const tribute = new TributeModel({ id });
    await tribute.fetch();
    return tribute.toJSON();
  },
  
  // Get a tribute by slug
  getTributeBySlug: async (slug: string) => {
    // Use fetch directly since this is a custom endpoint
    const response = await fetch(`/api/tributes/by-slug/${slug}`);
    if (!response.ok) {
      throw new Error('Failed to fetch tribute by slug');
    }
    return await response.json();
  },
  
  // Get all tributes
  getTributes: async (params = {}) => {
    const tributes = new TributesCollection();
    await tributes.fetch({ data: params });
    return tributes.toJSON();
  },
  
  // Create a new tribute
  createTribute: async (tributeData: any) => {
    const tribute = new TributeModel(tributeData);
    await tribute.save();
    return tribute.toJSON();
  },
  
  // Update an existing tribute
  updateTribute: async (id: number, tributeData: any) => {
    const tribute = new TributeModel({ id, ...tributeData });
    await tribute.save();
    return tribute.toJSON();
  },
  
  // Delete a tribute
  deleteTribute: async (id: number) => {
    const tribute = new TributeModel({ id });
    await tribute.destroy();
    return true;
  }
};
```

## Advantages of This Approach

1. **Leverages Existing API Endpoints**: Uses your existing SvelteKit API proxy endpoints rather than creating new ones.
2. **Separation of Concerns**: Keeps the Backbone.js models and collections separate from your SvelteKit components.
3. **Type Safety**: Uses TypeScript interfaces to ensure type safety throughout the application.
4. **Authentication Handling**: Includes JWT authentication handling with the WordPress API.
5. **Reactive State**: Integrates with Svelte's reactive state management through stores.
6. **Progressive Enhancement**: Works with or without JavaScript, thanks to SvelteKit's server-side rendering.

## Next Steps

1. **Implement Error Handling**: Add more robust error handling throughout the application.
2. **Add Form Validation**: Implement form validation for user inputs.
3. **Create More Views**: Develop additional views for different WordPress content types.
4. **Add Pagination**: Implement pagination for collections with large numbers of items.
5. **Implement Caching**: Add caching to improve performance and reduce API calls.