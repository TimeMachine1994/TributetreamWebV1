import { writable } from 'svelte/store';

// Create a writable store for the user ID
// Create the store to manage user state
export const userStore = writable({
    token: null,
    displayName: null,
    email: null,
    nicename: null
});