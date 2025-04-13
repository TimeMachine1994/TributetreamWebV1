/**
 * Toast Store
 * 
 * Manages toast notifications throughout the application
 */

import { writable } from 'svelte/store';

// Toast notification interface
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number;
  showClose?: boolean;
}

// Create a writable store with an empty array of toasts
const toasts = writable<Toast[]>([]);

// Toast store with methods for adding and removing toasts
export const toastStore = {
  // Subscribe to the store
  subscribe: toasts.subscribe,
  
  /**
   * Add a success toast
   */
  success: (message: string, options: Partial<Omit<Toast, 'type' | 'message' | 'id'>> = {}) => {
    const id = crypto.randomUUID();
    
    toasts.update(all => [
      ...all,
      {
        id,
        type: 'success',
        message,
        duration: 5000,
        showClose: true,
        ...options
      }
    ]);
    
    return id;
  },
  
  /**
   * Add an error toast
   */
  error: (message: string, options: Partial<Omit<Toast, 'type' | 'message' | 'id'>> = {}) => {
    const id = crypto.randomUUID();
    
    toasts.update(all => [
      ...all,
      {
        id,
        type: 'error',
        message,
        duration: 0, // Error toasts don't auto-dismiss by default
        showClose: true,
        ...options
      }
    ]);
    
    return id;
  },
  
  /**
   * Add an info toast
   */
  info: (message: string, options: Partial<Omit<Toast, 'type' | 'message' | 'id'>> = {}) => {
    const id = crypto.randomUUID();
    
    toasts.update(all => [
      ...all,
      {
        id,
        type: 'info',
        message,
        duration: 5000,
        showClose: true,
        ...options
      }
    ]);
    
    return id;
  },
  
  /**
   * Add a warning toast
   */
  warning: (message: string, options: Partial<Omit<Toast, 'type' | 'message' | 'id'>> = {}) => {
    const id = crypto.randomUUID();
    
    toasts.update(all => [
      ...all,
      {
        id,
        type: 'warning',
        message,
        duration: 7000,
        showClose: true,
        ...options
      }
    ]);
    
    return id;
  },
  
  /**
   * Remove a toast by ID
   */
  remove: (id: string) => {
    toasts.update(all => all.filter(t => t.id !== id));
  },
  
  /**
   * Remove all toasts
   */
  clear: () => {
    toasts.set([]);
  }
};