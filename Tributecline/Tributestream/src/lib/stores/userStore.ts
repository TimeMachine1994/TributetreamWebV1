import { writable } from 'svelte/store';

export interface User {
  id: number;
  username: string;
  email: string;
  displayName: string;
  roles: string[];
  meta: Record<string, any>;
  token?: string;
}

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

function createUserStore() {
  const initialState: UserState = {
    user: null,
    isLoading: false,
    error: null
  };

  const { subscribe, set, update } = writable<UserState>(initialState);

  return {
    subscribe,
    
    setUser: (user: User | null) => update(state => ({
      ...state,
      user,
      error: null
    })),

    setLoading: (isLoading: boolean) => update(state => ({
      ...state,
      isLoading,
      error: isLoading ? null : state.error
    })),

    setError: (error: string | null) => update(state => ({
      ...state,
      error,
      isLoading: false
    })),

    updateUserMeta: (meta: Record<string, any>) => update(state => ({
      ...state,
      user: state.user ? {
        ...state.user,
        meta: {
          ...state.user.meta,
          ...meta
        }
      } : null
    })),

    clear: () => set(initialState)
  };
}

export const userStore = createUserStore();
