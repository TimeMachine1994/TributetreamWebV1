import { writable, derived, get } from 'svelte/store';

export const currentPage = writable(1);
export const livestreamAtFuneralHome = writable(null);
export const selectedPackage = writable('');
export const additionalLocations = writable({ secondAddress: false, thirdAddress: false });
export const livestreamDuration = writable(2);
export const packagePrices = { 'Solo': 399, 'Anywhere': 499, 'Legacy': 799 };
export const masterPrice = writable(0);
export const urlFriendlyText = writable("your_loved_ones_name_here");
export const formData = writable({
    lovedOnesName: '',
    livestreamDate: '',
    yourName: '',
    email: '',
    phoneNumber: '',
    secondAddress: '',
    thirdAddress: ''
});
export const additionalCharges = writable([]);

export const totalCost = derived([masterPrice, additionalCharges], ([$masterPrice, $additionalCharges]) => {
    return $masterPrice + $additionalCharges.reduce((sum, charge) => sum + charge.price, 0);
});

function calculateAdditionalCharges() {
    let charges = [];
    const locations = get(additionalLocations);
    const duration = get(livestreamDuration);

    if (locations.secondAddress) {
        charges.push({ item: 'Location B', price: 399 });
    }
    if (locations.thirdAddress) {
        charges.push({ item: 'Location C', price: 329 });
    }
    if (duration > 2) {
        charges.push({ item: `Additional Livestream Time (${duration - 2}h)`, price: (duration - 2) * 99 });
    }

    additionalCharges.set(charges);
}

export function selectPackage(packageName) {
    selectedPackage.set(packageName);
    masterPrice.set(packagePrices[packageName]);
    calculateAdditionalCharges();
}

export function convertText(name) {
    urlFriendlyText.set(name.replace(/\s+/g, '_').toLowerCase());
}

export function updateLivestreamDuration(duration) {
    livestreamDuration.set(duration);
    calculateAdditionalCharges(); // Ensure charges are recalculated when duration updates
}

export function updateLocations(locationUpdates) {
    additionalLocations.set(locationUpdates);
    calculateAdditionalCharges(); // Ensure charges are recalculated when locations update
}

// Subscriptions to ensure that additional charges are recalculated whenever these values change
selectedPackage.subscribe(() => calculateAdditionalCharges());
livestreamDuration.subscribe(() => calculateAdditionalCharges());
additionalLocations.subscribe(() => calculateAdditionalCharges());