# Store to Props Migration Plan
Last Updated: 2/16/2025

## Calc.svelte Changes

### Current Implementation
```typescript
import { masterStore } from '$lib/stores/userStore';
// Using store for order data management
masterStore.updateOrderData({...});
```

### New Implementation
1. Replace store with props:
```typescript
let { onOrderUpdate } = $props<{
    onOrderUpdate: (orderData: OrderData) => void;
}>();

// Replace store update with prop callback
onOrderUpdate({
    details: {
        cartItems: [{ name: selectedPackage, price: total }],
        total,
        duration,
        livestreamDate,
        livestreamStartTime,
        locations
    }
});
```

2. Use $state for local state:
```typescript
let basePrice = $state(550);
let duration = $state(2);
let allowOverrun = $state(false);
let selectedPackage = $state('Solo');
let total = $state(0);
```

3. Use $derived for computed values:
```typescript
let total = $derived(calculateTotal());
let isFormValid = $derived(Object.keys(errors).length === 0);
```

## Implementation Steps
1. Update Calc.svelte component
2. Update parent components to pass callbacks
3. Remove masterStore dependency
4. Update type definitions

## Migration Strategy
1. Make changes incrementally
2. Test each change
3. Ensure proper type safety
4. Maintain existing functionality