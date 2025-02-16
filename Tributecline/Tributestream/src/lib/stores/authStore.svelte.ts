import { writable, type Writable } from 'svelte/store';
import { userStore, type User } from './userStore';

/**
 * Auth state interface
 */
interface AuthState {
    isAuthenticated: boolean;
    role: string | null;    // Primary role (for backwards compatibility)
    roles: string[];       // All user roles
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
        roles: [],
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

        initFromUser: (user: User) => {
            // Ensure roles is always an array
            const roles = Array.isArray(user.roles) ? user.roles : 
                         user.roles ? [user.roles] : ['subscriber'];
            
            update(() => ({
                isAuthenticated: true,
                roles,
                role: roles[0], // Set primary role for backwards compatibility
                calculatorStatus: user.meta?.calculatorStatus || null
            }));
        }
    };
}

// Export singleton instance
export const authStore = createAuthStore();

// Computed properties as functions
export function isAdmin(state: AuthState): boolean {
    return state.roles.includes('administrator');
}

export function isSubscriber(state: AuthState): boolean {
    return state.roles.includes('subscriber') && !isAdmin(state);
}

export function getPrimaryRole(state: AuthState): string {
    return state.role || state.roles[0] || 'subscriber';
}

export function hasRole(state: AuthState, role: string): boolean {
    return state.roles.includes(role);
}

export function needsCalculator(state: AuthState): boolean {
    return isSubscriber(state) && !state.calculatorStatus?.completed;
}