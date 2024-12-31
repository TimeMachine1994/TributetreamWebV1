import { writable } from 'svelte/store';

export const livestreams = writable([]);
export const users = writable([]);
export const tributes = writable([]);

export const isDataLoaded = writable(false);
export const hasError = writable(false);
 