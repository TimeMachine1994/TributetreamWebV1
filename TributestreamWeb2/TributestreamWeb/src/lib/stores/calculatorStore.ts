// $lib/stores/calculatorStore.ts
import { writable, derived } from 'svelte/store';

// Form Data Interface
interface FormData {
  yourName: string;
  email: string;
  phoneNumber: string;
  livestreamDate: string;
  livestreamTime: string;
  livestreamLocation: string;
  secondAddress?: string;
  thirdAddress?: string;
}

// Create writable stores
export const currentPage = writable(1);
export const livestreamAtFuneralHome = writable(false);
export const selectedPackage = writable('');
export const masterPrice = writable(0);
export const urlFriendlyText = writable('');
export const livestreamDuration = writable(1);
export const additionalLocations = writable({
  secondAddress: false,
  thirdAddress: false
});
export const formData = writable<FormData>({
  yourName: '',
  email: '',
  phoneNumber: '',
  livestreamDate: '',
  livestreamTime: '',
  livestreamLocation: '',
});

// Create derived stores
export const additionalCharges = derived(
  [additionalLocations, livestreamDuration],
  ([$additionalLocations, $livestreamDuration]) => {
    const charges = [];
    if ($additionalLocations.secondAddress) {
      charges.push({ item: 'Second Location', price: 100 });
    }
    if ($additionalLocations.thirdAddress) {
      charges.push({ item: 'Third Location', price: 100 });
    }
    if ($livestreamDuration > 1) {
      charges.push({ 
        item: 'Extended Duration', 
        price: ($livestreamDuration - 1) * 50 
      });
    }
    return charges;
  }
);

export const totalCost = derived(
  [masterPrice, additionalCharges],
  ([$masterPrice, $additionalCharges]) => {
    const additionalCost = $additionalCharges.reduce((sum, charge) => sum + charge.price, 0);
    return $masterPrice + additionalCost;
  }
);

// Store update functions
export function selectPackage(packageName: string) {
  selectedPackage.set(packageName);
  switch (packageName) {
    case 'Solo':
      masterPrice.set(399);
      break;
    case 'Anywhere':
      masterPrice.set(499);
      break;
    case 'Legacy':
      masterPrice.set(799);
      break;
  }
}

export function convertText(text: string) {
  const friendly = text.toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  urlFriendlyText.set(friendly);
}

export function updateFormData(key: keyof FormData, value: string) {
  formData.update(data => ({
    ...data,
    [key]: value
  }));
}

export function nextPage() {
  currentPage.update(n => n + 1);
}

export function previousPage() {
  currentPage.update(n => n - 1);
}