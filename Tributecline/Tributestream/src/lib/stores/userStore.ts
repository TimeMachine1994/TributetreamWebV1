import { writable } from 'svelte/store';

interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: string;
}

function createUserStore() {
  const { subscribe, set, update } = writable<User | null>(null);

  return {
    subscribe,
    set: (user: User | null) => set(user),
    update: (updater: (user: User | null) => User | null) => update(updater),
    clear: () => set(null)
  };
}

export const userStore = createUserStore();
