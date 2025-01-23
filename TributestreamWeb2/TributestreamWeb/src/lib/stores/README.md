# Master Store

A centralized store for managing user and order data in TributeStream. This store provides a single source of truth for application state and persists data to localStorage to avoid unnecessary API calls.

## Usage

```typescript
import { masterStore } from '$lib/stores/userStore';

// Subscribe to store changes
masterStore.subscribe(state => {
    console.log('Store updated:', state);
});

// Update user data
masterStore.updateUserData({
    appId: 'new-app-id',
    userMeta: {
        memorial_form_data: 'updated-data'
    }
});

// Update order data
masterStore.updateOrderData({
    orderId: 'new-order',
    status: 'pending'
});

// Get current store value
const currentState = masterStore.getValue();

// Clear store
masterStore.clear();
```

## Features

- Persistent storage using localStorage
- Type-safe updates with TypeScript
- Automatic timestamp tracking for updates
- Centralized state management
- Prevents redundant API calls by caching data

## Store Structure

```typescript
interface MasterStore {
    userData: {
        appId?: string;
        locationId?: string;
        userMeta: {
            memorial_form_data?: string;
            [key: string]: string | undefined;
        };
        lastUpdated: number;
    };
    orderData: {
        orderId?: string;
        status?: string;
        details?: any;
        lastUpdated: number;
    };
    initialized: boolean;
}
```

## Best Practices

1. Always use the type-safe update methods instead of directly modifying the store
2. Check the `initialized` flag before assuming data is available
3. Use the `lastUpdated` timestamps to determine if data needs refreshing
4. Clear the store when logging out or switching users
