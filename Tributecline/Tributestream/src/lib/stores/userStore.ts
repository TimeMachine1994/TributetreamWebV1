import { writable } from 'svelte/store';
import type { MasterStore } from '$lib/stores/types';

function createMasterStore() {
    const { subscribe, set, update } = writable<MasterStore>({
        orderData: {
            funeralHome: null,
            selectedPackage: null,
            details: undefined
        }
    });

    return {
        subscribe,
        updateOrderData: (newData: Partial<MasterStore['orderData']>) => update(store => {
            store.orderData = { ...store.orderData, ...newData };
            return store;
        }),
        clear: () => set({ orderData: { funeralHome: null, selectedPackage: null, details: undefined } })
    };
}

export const masterStore = createMasterStore();
