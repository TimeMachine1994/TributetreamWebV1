import { writable, get } from 'svelte/store';
import type { MasterStore, UserData, OrderData, StoreUpdate } from './types';

const STORE_KEY = 'tributestream_master_store';

const createInitialState = (): MasterStore => ({
    userData: {
        userMeta: {},
        lastUpdated: Date.now()
    },
    orderData: {
        lastUpdated: Date.now()
    },
    initialized: false
});

const createMasterStore = () => {
    // Initialize store with default state
    const store = writable<MasterStore>(createInitialState());
    
    // Load persisted data if it exists
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                store.set({ ...parsed, initialized: true });
            } catch (e) {
                console.error('Failed to parse stored data:', e);
            }
        }
    }

    return {
        subscribe: store.subscribe,
        
        // Update user data
        updateUserData: (update: Partial<Omit<UserData, 'lastUpdated'>>) => {
            store.update(state => {
                const newState = {
                    ...state,
                    userData: {
                        ...state.userData,
                        ...update,
                        lastUpdated: Date.now()
                    }
                };
                if (typeof window !== 'undefined') {
                    localStorage.setItem(STORE_KEY, JSON.stringify(newState));
                }
                return newState;
            });
        },

        // Update order data
        updateOrderData: (update: Partial<Omit<OrderData, 'lastUpdated'>>) => {
            store.update(state => {
                const newState = {
                    ...state,
                    orderData: {
                        ...state.orderData,
                        ...update,
                        lastUpdated: Date.now()
                    }
                };
                if (typeof window !== 'undefined') {
                    localStorage.setItem(STORE_KEY, JSON.stringify(newState));
                }
                return newState;
            });
        },

        // Clear all stored data
        clear: () => {
            store.set(createInitialState());
            if (typeof window !== 'undefined') {
                localStorage.removeItem(STORE_KEY);
            }
        },

        // Get current store value
        getValue: () => get(store)
    };
};

export const masterStore = createMasterStore();
