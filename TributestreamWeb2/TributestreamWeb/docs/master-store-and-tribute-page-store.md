# Master Store and Tribute Page Store Documentation

## 1. Overview
This document provides a detailed explanation of the `MasterStore` and `TributePageStore` classes, which are used for state management in the TributestreamWeb application.

## 2. Master Store (`master-store.svelte.ts`)

### 2.1 Purpose
The `MasterStore` class serves as a centralized state management system for handling funeral service-related data. It manages information about:
- Funeral director
- Loved one
- User
- Memorial events
- Live streaming
- Billing
- Scheduling

### 2.2 Data Structure
- **DirectorInfo**: Stores details about the funeral director.
- **LovedOneInfo**: Stores details about the deceased individual.
- **UserInfo**: Stores details about the user managing the tribute.
- **MemorialInfo**: Stores details about memorial locations and schedules.
- **LiveStreamInfo**: Stores details about live streaming events.
- **BillingInfo**: Stores billing and payment status.
- **PackageInfo**: Stores selected service packages and pricing.
- **ScheduleDay**: Stores daily schedules for memorial events.

### 2.3 Methods
- **Update Methods**: Functions to update each section of the store.
- **Computed Properties**:
  - `numberOfLocations`: Returns the number of memorial locations.
  - `funeralDirectorName`: Returns the full name of the funeral director.
- **Validation**:
  - `validateRequiredFields()`: Ensures required fields are filled.
- **Persistence**:
  - `saveToLocalStorage()`: Saves store data to `localStorage`.
  - `loadFromLocalStorage()`: Loads store data from `localStorage`.
- **Context Management**:
  - `setMasterStoreContext()`: Initializes and sets the store in Svelte's context.
  - `getMasterStoreContext()`: Retrieves the store from Svelte's context.

---

## 3. Tribute Page Store (`tribute-page-store.svelte.ts`)

### 3.1 Purpose
The `TributePageStore` class manages the state for tribute pages, including tribute details, search results, and authentication.

### 3.2 Data Structure
- **Tribute**: Stores details about a tribute page.
- **TributeSearchResults**: Stores search results for tributes.
- **RecentTributes**: Caches recently created or updated tributes.
- **AuthToken**: Stores the authentication token for API requests.

### 3.3 Methods
- **Update Methods**:
  - `updateCurrentTribute()`: Updates the current tribute.
  - `setAuthToken()`: Sets the authentication token.
- **Slug and URL Generation**:
  - `generateSlug()`: Generates a URL-friendly slug from a title.
  - `generateTributeUrl()`: Constructs the tribute page URL.
- **API Interactions**:
  - `searchTributes()`: Searches for tributes.
  - `fetchTributeById()`: Fetches a tribute by ID.
  - `fetchTributeBySlug()`: Fetches a tribute by slug.
  - `createTribute()`: Creates a new tribute.
  - `updateTribute()`: Updates an existing tribute.
  - `deleteTribute()`: Deletes a tribute.
- **Persistence**:
  - `saveToLocalStorage()`: Saves store data to `localStorage`.
  - `loadFromLocalStorage()`: Loads store data from `localStorage`.
- **Context Management**:
  - `setTributePageStoreContext()`: Initializes and sets the store in Svelte's context.
  - `getTributePageStoreContext()`: Retrieves the store from Svelte's context.

---

## 4. Usage Examples
### Updating the Director's Information in `MasterStore`
```typescript
const masterStore = getMasterStoreContext();
masterStore.updateDirectorInfo({ firstName: 'John', lastName: 'Doe' });
```

### Fetching a Tribute by ID in `TributePageStore`
```typescript
const tributeStore = getTributePageStoreContext();
tributeStore.fetchTributeById(123);
```

---

## 5. Best Practices
- Use the stores efficiently to avoid unnecessary reactivity loops.
- Ensure data consistency across components.
- Persist data properly to prevent loss of user input.