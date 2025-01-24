import { writable, derived } from 'svelte/store';
import { BatesManager, type BatesConfig } from '../utils/BatesManager';

// Default configuration for Bates numbering
const defaultConfig: BatesConfig = {
  prefix: 'EXH',
  startNumber: 1,
  padLength: 4
};

function createBatesStore() {
  const batesManager = new BatesManager(defaultConfig);
  const { subscribe, set, update } = writable(batesManager);

  return {
    subscribe,
    
    // Initialize the Bates index with file paths
    initializeIndex: (filePaths: string[]) => {
      update(manager => {
        manager.createBatesIndex(filePaths);
        return manager;
      });
    },

    // Search for files by Bates number
    searchByBates: (query: string) => {
      let results: Array<{ batesNumber: string; filePath: string }> = [];
      update(manager => {
        results = manager.searchByBates(query);
        return manager;
      });
      return results;
    },

    // Reset the Bates numbering
    reset: () => {
      update(manager => {
        manager.reset();
        return manager;
      });
    },

    // Update the Bates configuration
    updateConfig: (config: Partial<BatesConfig>) => {
      update(manager => {
        const newManager = new BatesManager({
          ...defaultConfig,
          ...config
        });
        return newManager;
      });
    }
  };
}

// Create the store instance
export const batesStore = createBatesStore();

// Derived store for the current Bates index
export const batesIndex = derived(batesStore, $batesStore => $batesStore.getBatesIndex());
