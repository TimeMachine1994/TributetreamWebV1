import { setContext, getContext } from 'svelte';
import { saveTribute } from '$lib/utils/api-helpers';
import type { TributeData } from '$lib/utils/api-helpers';

// ----- Interfaces from Master Store and Tribute Page Store -----

// Director Information
export interface DirectorInfo {
  firstName: string;
  lastName: string;
  funeralHomeName: string;
  funeralHomeAddress: string;
}

// Loved One Information (serves as the source of truth for tribute title)
export interface LovedOneInfo {
  fullName: string;
  dateOfBirth?: string;
  dateOfPassing?: string;
}

// User Information
export interface UserInfo {
  fullName: string;
  emailAddress: string;
  dateOfBirth?: string;
  phoneNumber: string;
}

// Memorial Location
export interface MemorialLocation {
  name: string;
  address: string;
}

// Extended Memorial Location
export interface ExtendedMemorialLocation extends MemorialLocation {
  travelExceedsHour: boolean;
  startTime: string;
  duration: number;
  notes: string;
}

// Schedule Day
export interface ScheduleDay {
  date: string;
  locations: ExtendedMemorialLocation[];
}

// Memorial Information
export interface MemorialInfo {
  locations: MemorialLocation[];
  startTime?: string;
  date?: string;
}

// Live Stream Information
export interface LiveStreamInfo {
  duration?: string;
  date?: string;
  startTime?: string;
}

// Billing Information
export interface BillingInfo {
  firstName: string;
  lastName: string;
  address: string;
  creditCardDetails?: any;
  isPaymentComplete: boolean;
}

// Cart Item
export interface CartItem {
  name: string;
  price: number;
}

// Package Information
export interface PackageInfo {
  selection?: string;
  priceTotal: number;
  items?: CartItem[];
}

// Tribute Interface (from Tribute Page Store)
export interface Tribute {
  id?: number | string;
  slug: string;
  description?: string;
  memorialDate?: string;
  memorialLocation?: string;
  custom_html?: string | null;
  created_at?: string;
  updated_at?: string;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  [key: string]: any;
}

// Tribute Search Results
export interface TributeSearchResults {
  tributes: Tribute[];
  total_pages: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
}

// Unique symbol key for the unified context
const unifiedStoreKey = Symbol('unifiedStore');

/**
 * UnifiedStore class that combines all functionality from MasterStore and TributePageStore
 */
export class UnifiedStore {
  // ----- State from Master Store -----
  directorInfo = $state<Partial<DirectorInfo>>({});
  lovedOneInfo = $state<Partial<LovedOneInfo>>({});
  userInfo = $state<Partial<UserInfo>>({});
  memorialInfo = $state<MemorialInfo>({
    locations: [{ name: '', address: '' }]
  });
  liveStreamInfo = $state<Partial<LiveStreamInfo>>({});
  packageInfo = $state<Partial<PackageInfo>>({
    priceTotal: 0,
    items: []
  });
  billingInfo = $state<Partial<BillingInfo>>({
    isPaymentComplete: false
  });
  scheduleDays = $state<ScheduleDay[]>([{
    date: new Date().toISOString().split('T')[0],
    locations: [{
      name: '',
      address: '',
      travelExceedsHour: false,
      startTime: '09:00',
      duration: 2,
      notes: ''
    }]
  }]);

  // ----- State from Tribute Page Store -----
  currentTribute = $state<Partial<Tribute>>({
    slug: '',
    custom_html: null
  });
  searchResults = $state<TributeSearchResults>({
    tributes: [],
    total_pages: 1,
    currentPage: 1,
    isLoading: false,
    error: null
  });
  recentTributes = $state<Tribute[]>([]);
  authToken = $state<string | null>(null);

  // Flag to prevent infinite localStorage save loops
  private saveInProgress = $state(false);

  // ----- Computed Properties -----

  // Number of memorial locations
  get numberOfLocations() {
    return this.memorialInfo.locations.length;
  }

  // Full funeral director name
  get funeralDirectorName() {
    const { firstName, lastName } = this.directorInfo;
    if (!firstName && !lastName) return '';
    return `${firstName || ''} ${lastName || ''}`.trim();
  }

  // Get tribute title from loved one's name (single source of truth)
  get tributeTitle() {
    return this.lovedOneInfo.fullName || '';
  }

  // ----- Methods from Master Store -----

  // Update director information
  updateDirectorInfo(info: Partial<DirectorInfo>) {
    this.directorInfo = { ...this.directorInfo, ...info };
  }

  // Update loved one information
  updateLovedOneInfo(info: Partial<LovedOneInfo>) {
    this.lovedOneInfo = { ...this.lovedOneInfo, ...info };
    
    // Maintain synchronization with currentTribute
    if (info.fullName) {
      this.syncTributeTitle(info.fullName);
    }
  }

  // Update user information
  updateUserInfo(info: Partial<UserInfo>) {
    this.userInfo = { ...this.userInfo, ...info };
  }

  // Update memorial information
  updateMemorialInfo(info: Partial<Omit<MemorialInfo, 'locations'>>) {
    this.memorialInfo = { 
      ...this.memorialInfo, 
      ...info 
    };
  }

  // Update memorial location
  updateMemorialLocation(index: number, location: Partial<MemorialLocation>) {
    if (index >= 0 && index < this.memorialInfo.locations.length) {
      const locations = [...this.memorialInfo.locations];
      locations[index] = { ...locations[index], ...location };
      this.memorialInfo = { ...this.memorialInfo, locations };
    }
  }

  // Add memorial location
  addMemorialLocation() {
    const locations = [...this.memorialInfo.locations, { name: '', address: '' }];
    this.memorialInfo = { ...this.memorialInfo, locations };
  }

  // Remove memorial location
  removeMemorialLocation(index: number) {
    if (this.memorialInfo.locations.length > 1 && index >= 0 && index < this.memorialInfo.locations.length) {
      const locations = this.memorialInfo.locations.filter((_, i) => i !== index);
      this.memorialInfo = { ...this.memorialInfo, locations };
    }
  }

  // Update live stream information
  updateLiveStreamInfo(info: Partial<LiveStreamInfo>) {
    this.liveStreamInfo = { ...this.liveStreamInfo, ...info };
  }

  // Update package information
  updatePackageInfo(info: Partial<PackageInfo>) {
    this.packageInfo = { ...this.packageInfo, ...info };
  }

  // Update billing information
  updateBillingInfo(info: Partial<BillingInfo>) {
    this.billingInfo = { ...this.billingInfo, ...info };
  }

  // Complete payment
  completePayment() {
    this.billingInfo = { ...this.billingInfo, isPaymentComplete: true };
  }

  // Update schedule days
  updateScheduleDays(days: ScheduleDay[]) {
    this.scheduleDays = [...days];
  }

  // Add schedule day
  addScheduleDay() {
    const newDay: ScheduleDay = {
      date: new Date().toISOString().split('T')[0],
      locations: [{
        name: '',
        address: '',
        travelExceedsHour: false,
        startTime: '09:00',
        duration: 2,
        notes: ''
      }]
    };
    this.scheduleDays = [...this.scheduleDays, newDay];
  }

  // Remove schedule day
  removeScheduleDay(dayIndex: number) {
    if (this.scheduleDays.length > 1 && dayIndex >= 0 && dayIndex < this.scheduleDays.length) {
      this.scheduleDays = this.scheduleDays.filter((_, i) => i !== dayIndex);
    }
  }

  // Add schedule day location
  addScheduleDayLocation(dayIndex: number) {
    if (dayIndex >= 0 && dayIndex < this.scheduleDays.length) {
      const defaultLocation: ExtendedMemorialLocation = {
        name: '',
        address: '',
        travelExceedsHour: false,
        startTime: '09:00',
        duration: 2,
        notes: ''
      };
      
      const updatedDays = [...this.scheduleDays];
      updatedDays[dayIndex] = {
        ...updatedDays[dayIndex],
        locations: [...updatedDays[dayIndex].locations, defaultLocation]
      };
      
      this.scheduleDays = updatedDays;
    }
  }

  // Remove schedule day location
  removeScheduleDayLocation(dayIndex: number, locationIndex: number) {
    if (
      dayIndex >= 0 &&
      dayIndex < this.scheduleDays.length &&
      locationIndex >= 0 &&
      locationIndex < this.scheduleDays[dayIndex].locations.length &&
      this.scheduleDays[dayIndex].locations.length > 1
    ) {
      const updatedDays = [...this.scheduleDays];
      updatedDays[dayIndex] = {
        ...updatedDays[dayIndex],
        locations: updatedDays[dayIndex].locations.filter((_, i) => i !== locationIndex)
      };
      
      this.scheduleDays = updatedDays;
    }
  }

  // Update schedule day location
  updateScheduleDayLocation(dayIndex: number, locationIndex: number, location: Partial<ExtendedMemorialLocation>) {
    if (
      dayIndex >= 0 &&
      dayIndex < this.scheduleDays.length &&
      locationIndex >= 0 &&
      locationIndex < this.scheduleDays[dayIndex].locations.length
    ) {
      const updatedDays = [...this.scheduleDays];
      updatedDays[dayIndex] = {
        ...updatedDays[dayIndex],
        locations: updatedDays[dayIndex].locations.map((loc, i) =>
          i === locationIndex ? { ...loc, ...location } : loc
        )
      };
      
      this.scheduleDays = updatedDays;
    }
  }

  // Update schedule day date
  updateScheduleDayDate(dayIndex: number, date: string) {
    if (dayIndex >= 0 && dayIndex < this.scheduleDays.length) {
      const updatedDays = [...this.scheduleDays];
      updatedDays[dayIndex] = {
        ...updatedDays[dayIndex],
        date
      };
      
      this.scheduleDays = updatedDays;
    }
  }

  // Validate required fields
  validateRequiredFields(): { isValid: boolean; missingFields: string[] } {
    const missingFields: string[] = [];
    
    // Director Info required fields
    if (!this.directorInfo.firstName) missingFields.push('Director\'s First Name');
    if (!this.directorInfo.lastName) missingFields.push('Director\'s Last Name');
    if (!this.directorInfo.funeralHomeName) missingFields.push('Funeral Home Name');
    if (!this.directorInfo.funeralHomeAddress) missingFields.push('Funeral Home Address');
    
    // Loved One Info required fields
    if (!this.lovedOneInfo.fullName) missingFields.push('Loved One\'s Full Name');
    
    // User Info required fields
    if (!this.userInfo.fullName) missingFields.push('User\'s Full Name');
    if (!this.userInfo.emailAddress) missingFields.push('User\'s Email Address');
    if (!this.userInfo.phoneNumber) missingFields.push('User\'s Phone Number');
    
    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }

  // ----- Methods from Tribute Page Store -----

  // Update current tribute
  updateCurrentTribute(tributeData: Partial<Tribute>): void {
    // Handle special synchronization with lovedOneInfo
    const { title, ...rest } = tributeData as Partial<Tribute & { title?: string }>;
    
    // If title is provided, update lovedOneInfo.fullName
    if (title) {
      this.updateLovedOneInfo({ fullName: title });
    }
    
    this.currentTribute = { ...this.currentTribute, ...rest };
  }

  // Set authentication token
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  // Generate slug from title
  generateSlug(title?: string): string {
    const sourceTitle = title || this.lovedOneInfo.fullName || '';
    const baseSlug = sourceTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')  // Remove special chars except spaces and hyphens
      .replace(/\s+/g, '-')          // Replace spaces with hyphens
      .replace(/-+/g, '-')           // Replace multiple hyphens with a single one
      .trim();
    
    return baseSlug ? `celebration-of-life-for-${baseSlug}` : '';
  }

  // Generate tribute page URL
  generateTributeUrl(tribute?: Partial<Tribute>): string {
    const slug = tribute?.slug || this.currentTribute.slug;
    if (!slug) {
      return '';
    }
    
    // If slug already contains the prefix, return as is
    if (slug.startsWith('celebration-of-life-for-')) {
      return `/${slug}`;
    }
    
    return `/celebration-of-life-for-${slug}`;
  }

  // Search tributes
  async searchTributes(query: string, page: number = 1, perPage: number = 10): Promise<void> {
    try {
      this.searchResults.isLoading = true;
      this.searchResults.error = null;

      const response = await fetch(`/api/tributes?search=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      this.searchResults = {
        tributes: data.tributes || [],
        total_pages: data.total_pages || 1,
        currentPage: page,
        isLoading: false,
        error: null
      };
    } catch (error) {
      console.error('Error searching tributes:', error);
      this.searchResults = {
        ...this.searchResults,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      };
    }
  }

  // Fetch tribute by ID
  async fetchTributeById(id: string | number): Promise<Tribute | null> {
    try {
      const response = await fetch(`/api/tributes/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tribute: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.tribute) {
        // Handle synchronization between currentTribute and lovedOneInfo
        const { title, ...rest } = data.tribute as Tribute & { title?: string };
        
        if (title) {
          this.updateLovedOneInfo({ fullName: title });
        }
        
        this.currentTribute = { ...this.currentTribute, ...rest };
        return data.tribute;
      }
      return null;
    } catch (error) {
      console.error('Error fetching tribute:', error);
      return null;
    }
  }

  // Fetch tribute by slug
  async fetchTributeBySlug(slug: string): Promise<Tribute | null> {
    try {
      const response = await fetch(`/api/tributes/by-slug/${slug}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tribute: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.tribute) {
        // Handle synchronization between currentTribute and lovedOneInfo
        const { title, ...rest } = data.tribute as Tribute & { title?: string };
        
        if (title) {
          this.updateLovedOneInfo({ fullName: title });
        }
        
        this.currentTribute = { ...this.currentTribute, ...rest };
        return data.tribute;
      }
      return null;
    } catch (error) {
      console.error('Error fetching tribute by slug:', error);
      return null;
    }
  }

  // Create tribute
  async createTribute(tributeData: Partial<Tribute>): Promise<Tribute | null> {
    try {
      if (!this.authToken) {
        throw new Error('Authentication token is required');
      }

      // Use lovedOneInfo.fullName as the title if not provided
      const title = tributeData.title || this.lovedOneInfo.fullName || '';
      
      // Format the data according to the TributeData interface
      const formattedData: TributeData = {
        title: title,
        slug: tributeData.slug || this.generateSlug(title),
        custom_html: tributeData.custom_html || null,
        user_name: tributeData.user_name || this.userInfo.fullName || 'Anonymous',
        user_email: tributeData.user_email || this.userInfo.emailAddress || 'anonymous@example.com',
        user_phone: tributeData.user_phone || this.userInfo.phoneNumber || '000-000-0000',
        memorial_date: this.memorialInfo.date,
        memorial_location: this.memorialInfo.locations[0]?.name
      };

      const result = await saveTribute(formattedData, this.authToken);
      
      if (result && result.tribute) {
        // Update both currentTribute and lovedOneInfo
        const { title: resultTitle, ...rest } = result.tribute as Tribute & { title?: string };
        
        if (resultTitle) {
          this.updateLovedOneInfo({ fullName: resultTitle });
        }
        
        this.currentTribute = { ...this.currentTribute, ...rest };
        this.recentTributes = [...this.recentTributes, result.tribute];
        return result.tribute;
      }
      return null;
    } catch (error) {
      console.error('Error creating tribute:', error);
      return null;
    }
  }

  // Update tribute
  async updateTribute(id: string | number, tributeData: Partial<Tribute>): Promise<Tribute | null> {
    try {
      if (!this.authToken) {
        throw new Error('Authentication token is required');
      }

      // Handle title synchronization
      const { title, ...rest } = tributeData as Partial<Tribute & { title?: string }>;
      
      // Use lovedOneInfo.fullName as the title if provided title is empty
      const updatedTitle = title || this.lovedOneInfo.fullName;
      
      const requestData = {
        id,
        ...rest,
        ...(updatedTitle ? { title: updatedTitle } : {}),
        updated_at: new Date().toISOString()
      };

      const response = await fetch(`/api/tributes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.authToken
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update tribute: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.tribute) {
        // Process title in response if provided
        const { title: responseTitle, ...responseRest } = data.tribute as Tribute & { title?: string };
        
        if (responseTitle) {
          this.updateLovedOneInfo({ fullName: responseTitle });
        }
        
        this.currentTribute = { ...this.currentTribute, ...responseRest };
        
        // Update in recent tributes cache
        this.recentTributes = this.recentTributes.map(tribute => 
          tribute.id === id ? { ...tribute, ...data.tribute } : tribute
        );
        
        return data.tribute;
      }
      return null;
    } catch (error) {
      console.error('Error updating tribute:', error);
      return null;
    }
  }

  // Delete tribute
  async deleteTribute(id: string | number): Promise<boolean> {
    try {
      if (!this.authToken) {
        throw new Error('Authentication token is required');
      }

      const response = await fetch(`/api/tributes/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.authToken
        },
        body: JSON.stringify({ id })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete tribute: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Remove from recent tributes cache
        this.recentTributes = this.recentTributes.filter(tribute => tribute.id !== id);
        
        // Clear current tribute if it's the one being deleted
        if (this.currentTribute.id === id) {
          this.currentTribute = { slug: '', custom_html: null };
          // Also reset lovedOneInfo if this was the current tribute
          this.lovedOneInfo = {};
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting tribute:', error);
      return false;
    }
  }

  // ----- Unified Synchronization Methods -----

  // Synchronize tribute title with lovedOneInfo.fullName
  private syncTributeTitle(fullName: string) {
    // No need to use updateCurrentTribute here to avoid circular updates
    if (fullName) {
      this.currentTribute = {
        ...this.currentTribute,
        // We don't set title directly as it's derived from lovedOneInfo.fullName
      };
    }
  }

  // ----- Unified Persistence Methods -----

  // Save to localStorage
  saveToLocalStorage() {
    if (typeof window !== 'undefined' && !this.saveInProgress) {
      this.saveInProgress = true;
      
      const data = {
        directorInfo: this.directorInfo,
        lovedOneInfo: this.lovedOneInfo,
        userInfo: this.userInfo,
        memorialInfo: this.memorialInfo,
        liveStreamInfo: this.liveStreamInfo,
        packageInfo: this.packageInfo,
        billingInfo: this.billingInfo,
        scheduleDays: this.scheduleDays,
        currentTribute: this.currentTribute,
        recentTributes: this.recentTributes,
        authToken: this.authToken
      };
      
      localStorage.setItem('unifiedStoreData', JSON.stringify(data));
      
      // Remove legacy storage items to force migration
      localStorage.removeItem('funeralServiceData');
      localStorage.removeItem('tributePageStore');
      
      setTimeout(() => {
        this.saveInProgress = false;
      }, 100);
    }
  }

  // Load from localStorage
  loadFromLocalStorage(): boolean {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('unifiedStoreData');
      
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          
          this.directorInfo = data.directorInfo || {};
          this.lovedOneInfo = data.lovedOneInfo || {};
          this.userInfo = data.userInfo || {};
          this.memorialInfo = data.memorialInfo || { locations: [{ name: '', address: '' }] };
          this.liveStreamInfo = data.liveStreamInfo || {};
          this.packageInfo = data.packageInfo || { priceTotal: 0, items: [] };
          this.billingInfo = data.billingInfo || { isPaymentComplete: false };
          this.scheduleDays = data.scheduleDays || [{
            date: new Date().toISOString().split('T')[0],
            locations: [{
              name: '',
              address: '',
              travelExceedsHour: false,
              startTime: '09:00',
              duration: 2,
              notes: ''
            }]
          }];
          this.currentTribute = data.currentTribute || { slug: '', custom_html: null };
          this.recentTributes = data.recentTributes || [];
          this.authToken = data.authToken || null;
          
          return true;
        } catch (e) {
          console.error('Failed to parse saved unified data:', e);
        }
      }
      
      // Attempt to migrate from legacy storage
      return this.migrateFromLegacyStorage();
    }
    return false;
  }

  // Migrate from legacy storage
  private migrateFromLegacyStorage(): boolean {
    let migrated = false;
    
    // Try loading from master store (funeral service data)
    const masterData = localStorage.getItem('funeralServiceData');
    if (masterData) {
      try {
        const data = JSON.parse(masterData);
        
        this.directorInfo = data.directorInfo || {};
        this.lovedOneInfo = data.lovedOneInfo || {};
        this.userInfo = data.userInfo || {};
        this.memorialInfo = data.memorialInfo || { locations: [{ name: '', address: '' }] };
        this.liveStreamInfo = data.liveStreamInfo || {};
        this.packageInfo = data.packageInfo || { priceTotal: 0, items: [] };
        this.billingInfo = data.billingInfo || { isPaymentComplete: false };
        this.scheduleDays = data.scheduleDays || [{
          date: new Date().toISOString().split('T')[0],
          locations: [{
            name: '',
            address: '',
            travelExceedsHour: false,
            startTime: '09:00',
            duration: 2,
            notes: ''
          }]
        }];
        
        migrated = true;
      } catch (e) {
        console.error('Failed to migrate master store data:', e);
      }
    }
    
    // Try loading from tribute store
    const tributeData = localStorage.getItem('tributePageStore');
    if (tributeData) {
      try {
        const data = JSON.parse(tributeData);
        
        this.currentTribute = data.currentTribute || { slug: '', custom_html: null };
        this.recentTributes = data.recentTributes || [];
        this.authToken = data.authToken || null;
        
        // Synchronize the title with lovedOneInfo if needed
        const titleFromTribute = (data.currentTribute as { title?: string })?.title;
        if (titleFromTribute && !this.lovedOneInfo.fullName) {
          this.lovedOneInfo = { 
            ...this.lovedOneInfo, 
            fullName: titleFromTribute 
          };
        }
        
        migrated = true;
      } catch (e) {
        console.error('Failed to migrate tribute store data:', e);
      }
    }
    
    // If we migrated any data, save it in the new unified format
    if (migrated) {
      this.saveToLocalStorage();
      
      // Clean up legacy storage
      localStorage.removeItem('funeralServiceData');
      localStorage.removeItem('tributePageStore');
    }
    
    return migrated;
  }

  // Reset the store to default state
  reset() {
    // Reset MasterStore data
    this.directorInfo = {};
    this.lovedOneInfo = {};
    this.userInfo = {};
    this.memorialInfo = { locations: [{ name: '', address: '' }] };
    this.liveStreamInfo = {};
    this.packageInfo = { priceTotal: 0, items: [] };
    this.billingInfo = { isPaymentComplete: false };
    this.scheduleDays = [{
      date: new Date().toISOString().split('T')[0],
      locations: [{
        name: '',
        address: '',
        travelExceedsHour: false,
        startTime: '09:00',
        duration: 2,
        notes: ''
      }]
    }];
    
    // Reset TributePageStore data
    this.currentTribute = { slug: '', custom_html: null };
    this.searchResults = {
      tributes: [],
      total_pages: 1,
      currentPage: 1,
      isLoading: false,
      error: null
    };
    
    // Intentionally not clearing authToken or recentTributes for UX purposes
  }
}

/**
 * Set the UnifiedStore in the context
 * @returns The UnifiedStore instance
 */
export function setUnifiedStoreContext(): UnifiedStore {
  const store = new UnifiedStore();
  
  // Load from localStorage if available
  if (typeof window !== 'undefined') {
    store.loadFromLocalStorage();
  }
  
  setContext(unifiedStoreKey, store);
  return store;
}

/**
 * Get the UnifiedStore from the context
 * @returns The UnifiedStore instance
 */
export function getUnifiedStoreContext(): UnifiedStore {
  return getContext(unifiedStoreKey);
}