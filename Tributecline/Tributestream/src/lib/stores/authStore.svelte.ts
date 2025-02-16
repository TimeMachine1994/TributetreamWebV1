import { writable, type Writable } from 'svelte/store';
import { userStore, type User } from './userStore';

/**
 * Auth state interface
 */
interface AuthState {
    isAuthenticated: boolean;
    role: string | null;
    calculatorStatus: {
        completed: boolean;
    } | null;
}

/**
 * Create a writable store with auth state
 */
function createAuthStore() {
    const initialState: AuthState = {
        isAuthenticated: false,
        role: null,
        calculatorStatus: null
    };

    const { subscribe, set, update } = writable<AuthState>(initialState);

    return {
        subscribe,
        
        setAuth: (auth: AuthState) => update(() => auth),

        setCalculatorStatus: (completed: boolean) => update(state => ({
            ...state,
            calculatorStatus: { completed }
        })),

        clear: () => set(initialState),

        initFromUser: (user: User) => update(() => ({
            isAuthenticated: true,
            role: user.roles[0] || 'subscriber',
            calculatorStatus: user.meta?.calculatorStatus || null
        }))
    };
}

// Export singleton instance
export const authStore = createAuthStore();

// Computed properties as functions
export function isAdmin(state: AuthState): boolean {
    return state.role === 'administrator';
}

export function isSubscriber(state: AuthState): boolean {
    return state.role === 'subscriber';
}

export function needsCalculator(state: AuthState): boolean {
    return isSubscriber(state) && !state.calculatorStatus?.completed;
}