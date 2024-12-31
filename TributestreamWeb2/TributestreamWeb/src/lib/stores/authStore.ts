import { writable } from 'svelte/store';

type AuthStore = {
    user: {
        id: number;
        email: string;
        name: string;
        token: string;
    } | null;
    isAuthenticated: boolean;
};

export const authStore = writable<AuthStore>({
    user: null,
    isAuthenticated: false
});
