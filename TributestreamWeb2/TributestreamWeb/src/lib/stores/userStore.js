import { writable } from 'svelte/store';

// Create a writable store for the user ID
export const userIdStore = writable(null);