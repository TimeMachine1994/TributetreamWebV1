 # Implementation Plan for Funeral Service Application

## **1. Overview**
We have implemented the following pages:
- **Home Page** (`src/routes/+page.svelte`)
- **Search Page** (`src/routes/search/+page.svelte`)
- **Create Page** (`src/routes/create/+page.svelte`)
- **Funeral Director Page** (`src/routes/funeral-director/+page.svelte`)
- **Calculator Page** (`src/routes/calculator/+page.svelte`)
- **Checkout Page** (`src/routes/checkout/+page.svelte`)
- **Schedule Page** (`src/routes/schedule/+page.svelte`)
- **Tribute Page** (`src/routes/celebration-of-life-for-[slug]/+page.svelte`)
- Schedule Page 
- Custom Tribute Page Template
- Login Page
- Family Dashboard

Each page interacts with two central stores:
- **Master Store** (`src/lib/stores/master-store.svelte.ts`) for user flow and service data
- **Tribute Store** (`src/lib/stores/tribute-page-store.svelte.ts`) for tribute-specific features

---

## **2. Data Flow and Page Implementation**

### **Home Page**
- **Elements:**
  - `lovedOnesFullName` input field (binds to `masterStore.lovedOneInfo.fullName`)
  - "Search" button (navigates to `/search` with the name as search parameter)
  - "Create" button (shows contact info form and generates custom URL)
  - Custom URL preview with editing capability
  - Contact information form when creating a tribute
- **Integration:**
  - Form submission creates a tribute entry in the API
  - Generates a custom URL following the pattern: `/celebration-of-life-for-{name}`
  - Updates both the master store and tribute store
  - Fowards the user the custom link through  SvleteKit's use :enhance and form actions. 

---

### **Search Page**
- **Elements:**
  - Search input field to search for loved one's names
  - Form submission with enhanced progressive enhancement
  - Pulls data from the tributes endpoint and stores it inot a list of tributes to be searched by loved ones name=
  - Results list showing matching tributes
  - Pagination controls for navigating through results
  - Links to view tribute pages 

- **Integration:**
  - Uses `searchTributes` API function for server-side searching\
  - Updates `tributeStore.searchResults` with results
  - Navigates to tribute page when selected
 
---

### **Create Page**
- **Elements:**
  - Inputs for:
    - `lovedOnesFullName` (pre-filled from `masterStore.lovedOneInfo.fullName`)
    - `usersFullName`
    - `usersEmailAddress`
    - `usersPhoneNumber`
  - "Next" button (navigates to `/celebration-of-life-for-[slug]`)

---

### **Funeral Director Page**
- **Elements:**
  - Inputs for:
    - `directorsFirstName`
    - `directorsLastName`
    - `funeralHomeName`
    - `funeralHomeAddress`
    - `lovedOnesFullName` (pre-filled)
    - `lovedOnesDOB`
    - `lovedOnesDateOfPassing`
    - `usersFullName` (pre-filled)
    - `usersEmailAddress` (pre-filled)
    - `usersDOB`
    - `usersPhoneNumber` (pre-filled)
    - `memorialLocationName`
    - `memorialLocationAddress`
    - `memorialStartTime`
    - `memorialDate`
  - "Next" button (navigates to `/celebration-of-life-for-[slug]`)
- **Integration:**
  - Updates user registration and tribute data simultaneously
  - Generates and displays the tribute URL
  - Stores memorial details in the tribute store
  - Creates or updates the tribute in the WordPress backend

---

### **Calculator Page**
- **Elements:**
  - Three package options: `Package A`, `Package B`, `Package C`
  - Pull this data from packages.js insde of /lib.
  - Editable fields:
    - `liveStreamDuration`
    - `liveStreamDate` (default: `memorialDate`)
    - `liveStreamStartTime` (default: `memorialStartTime`)
    - `funeralHomeName` (default: `funeralHomeName`)
    - `funeralDirectorName` (default: `directorsFirstName + directorsLastName`)
    - `memorialLocationName` (default: `funeralHomeName`)
    - `memorialLocationAddress` (default: `funeralHomeAddress`)
    - `numberOfLocations` (default: 1, allows up to 3)
    - `priceTotal` (computed based on package selection)
  - "Next" button (navigates to `/checkout`)

---

### **Checkout Page**
- **Elements:**
  - Summary of selections from Calculator Page
  - Inputs for:
    - `Billing first name`
    - `Billing last name`
    - `Billing Address`
    - `Billing Credit Card Form`
    - `isPaymentComplete`
  - "Complete Payment" button (marks `isPaymentComplete` as `true` and navigates to `/schedule`)

---

### **Schedule Page**
- **Elements:**
  - Displays  a simple booking form for the user, which registers them and sends them to the custom url. 

### **Family Dashboard**
- Understand the current layout and data display, and then refactor  so the data is displayed using our custom store and the layouts and tailwind css is unchanged. 
---

## **3. Store Integration**

### **Master Store Integration**
- **State Management:**
  - Uses `$state` for reactivity
  - Uses `$effect` to persist data to `localStorage`
  - Loads data from `localStorage` on initialization

- **Methods Implemented:**
  - `updateLovedOneInfo()`
  - `updateUserInfo()`
  - `updateDirectorInfo()`
  - `updateMemorialInfo()`
  - `updateLiveStreamInfo()`
  - `updatePackageInfo()`
  - `updateBillingInfo()`
  - `completePayment()`

### **Tribute Store Integration**
- **State Management:**
  - Uses `$state` for reactivity
  - Uses `$effect` to persist data to `localStorage`
  - Loads data from `localStorage` on initialization
  - Synchronizes with API endpoints

- **Methods Implemented:**
  - `updateCurrentTribute()`
  - `searchTributes()`
  - `fetchTributeById()`
  - `fetchTributeBySlug()`
  - `createTribute()`
  - `updateTribute()`
  - `deleteTribute()`
  - `generateSlug()`
  - `generateTributeUrl()`

---

## **4. Routing Structure**
```(NEEDS TO BE UDPATED)
src/routes/
  ├── +page.svelte (Home Page)
  ├── +page.server.ts (Server-side form actions)
  ├── search/
  │   ├── +page.svelte (Search Page)
  │   ├── +page.server.ts (Search form actions)
  ├── create/
  │   ├── +page.svelte (Create Page)
  │   ├── +page.server.ts (Create form actions)
  ├── funeral-director/
  │   ├── +page.svelte (Funeral Director Page)
  │   ├── +page.server.ts (Director form actions)
  ├── calculator/
  │   ├── +page.svelte (Calculator Page)
  │   ├── +page.server.ts (Calculator form actions)
  ├── checkout/
  │   ├── +page.svelte (Checkout Page)
  ├── schedule/
  │   ├── +page.svelte (Schedule Page)
  │   ├── +page.server.ts (Schedule form actions)
  ├── celebration-of-life-for-[slug]/
  │   ├── +page.svelte (Tribute Page)
  │   ├── +page.server.ts (Server-side tribute loading)
  │   ├── +page.js (Client-side tribute loading)
  ├── api/
  │   ├── tributes/
  │   │   ├── +server.ts (Tribute API endpoints)
  │   │   ├── [id]/
  │   │   │   ├── +server.ts (Single tribute API)
  │   │   ├── by-slug/
  │   │   │   ├── [slug]/
  │   │   │   │   ├── +server.ts (Tribute by slug API)
```

---

## **5. Data Flow Diagram**
```mermaid
graph TD;
    HomePage -->|User enters name| CreatePage;
    HomePage -->|User searches| SearchPage;
    HomePage -->|Create tribute directly| TributeStore;
    CreatePage -->|User enters details| FuneralDirectorPage;
    FuneralDirectorPage -->|User enters funeral details| CalculatorPage;
    FuneralDirectorPage -->|Updates tribute data| TributeStore;
    CalculatorPage -->|User selects package| CheckoutPage;
    CheckoutPage -->|User completes payment| SchedulePage;
    SearchPage -->|Search results| SearchResults;
    SearchResults -->|View tribute| TributePage;
    TributeStore -->|Generate slug| CustomURL;
    TributeStore -->|Persists data| localStorage;
    TributeStore -->|API Calls| WordPressBackend;
    CustomURL -->|Access tribute| TributePage;
```

---

## **6. Implementation Status & Future Enhancements**

### **Completed Implementation**
1. ✅ **Tribute Store** – Implemented the tribute-page-store.svelte.ts with full CRUD operations.
2. ✅ **API Integration** – Enhanced API helpers to support tribute operations.
3. ✅ **Custom URL Generation** – Implemented URL generation with "celebration-of-life-for-" pattern.
4. ✅ **Search Feature** – Added server-side searching with pagination and results display.
5. ✅ **Integration with Master Store** – Connected both stores for consistent data flow.

 