# Persisting User Input in the Master Store

## Introduction
In Svelte 5, the `$effect` rune allows us to synchronize external systems with the state inside our application. This is useful for persisting user input so that data is not lost on page refresh. In this guide, we will demonstrate how to:
- Bind form inputs to the master store
- Use `$effect` to automatically save data
- Load saved data when the application starts

## 1. Binding Form Inputs to the Store
We use `bind:value` to create two-way bindings between form inputs and the master store.

```svelte
<script lang="ts">
  import { getMasterStoreContext } from '$lib/stores/master-store.svelte';

  const masterStore = getMasterStoreContext();
</script>

<form class="space-y-4">
  <label>
    Director's First Name:
    <input type="text" bind:value={masterStore.directorInfo.firstName} class="border p-2 rounded" />
  </label>

  <label>
    Director's Last Name:
    <input type="text" bind:value={masterStore.directorInfo.lastName} class="border p-2 rounded" />
  </label>

  <label>
    Funeral Home Name:
    <input type="text" bind:value={masterStore.directorInfo.funeralHomeName} class="border p-2 rounded" />
  </label>

  <button type="button" on:click={() => masterStore.saveToLocalStorage()} class="bg-primary text-white px-4 py-2 rounded">
    Save Data
  </button>
</form>
```

## 2. Using `$effect` for Automatic Persistence
We use `$effect` to automatically save data whenever it changes.

```typescript
$effect(() => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('funeralServiceData', JSON.stringify({
      directorInfo: masterStore.directorInfo,
      lovedOneInfo: masterStore.lovedOneInfo,
      userInfo: masterStore.userInfo,
      memorialInfo: masterStore.memorialInfo,
      liveStreamInfo: masterStore.liveStreamInfo,
      packageInfo: masterStore.packageInfo,
      billingInfo: masterStore.billingInfo
    }));
  }
});
```

## 3. Loading Data on Initialization
Modify the store to load saved data when the application starts.

```typescript
export function loadFromLocalStorage() {
  if (typeof window !== 'undefined') {
    const savedData = localStorage.getItem('funeralServiceData');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        masterStore.directorInfo = data.directorInfo || {};
        masterStore.lovedOneInfo = data.lovedOneInfo || {};
        masterStore.userInfo = data.userInfo || {};
        masterStore.memorialInfo = data.memorialInfo || { locations: [{ name: '', address: '' }] };
        masterStore.liveStreamInfo = data.liveStreamInfo || {};
        masterStore.packageInfo = data.packageInfo || { priceTotal: 0 };
        masterStore.billingInfo = data.billingInfo || { isPaymentComplete: false };
      } catch (e) {
        console.error('Failed to parse saved data:', e);
      }
    }
  }
}
```

## Summary
- **Bind inputs** to store properties using `bind:value`.
- **Use `$effect`** to automatically save data when it changes.
- **Load saved data** when the application starts.

This ensures that user input persists across page refreshes and integrates seamlessly with the master store.