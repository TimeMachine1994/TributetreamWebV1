import { onMount } from 'svelte';
import { goto } from '$app/navigation';

// Configuration
const API_CONFIG = {
  BASE_URL: 'https://wp.tributestream.com/wp-json',
  ENDPOINTS: {
    REGISTER: '/my-custom-plugin/v1/register',
    SEND_EMAIL: '/my-custom-plugin/v1/send-email',
    LOGIN: '/jwt-auth/v1/token',
    CHECK_USERNAME: '/my-custom-plugin/v1/check-username',
    GET_NONCE: '/my-custom-plugin/v1/get-nonce',
    CREATE_PAGE: '/my-custom-plugin/v1/create-page',
    PAGES: '/wp/v2/pages'
  }
};

// Form State
interface FormState {
  tributeName: string;
  userFullName: string;
  userEmail: string;
  userPhone: string;
  username: string;
  urlSlug: string;
  tempUrlSlug: string;
}

// UI State
interface UIState {
  currentStep: number;
  isLoading: boolean;
  isEditing: boolean;
  isBlurred: boolean;
}

// Validation State
interface ValidationState {
  nameError: string;
  emailError: string;
  phoneError: string;
  generalError: string;
}

// Initialize states
let formState: FormState = {
  tributeName: '',
  userFullName: '',
  userEmail: '',
  userPhone: '',
  username: '',
  urlSlug: '',
  tempUrlSlug: ''
};

let uiState: UIState = {
  currentStep: 1,
  isLoading: false,
  isEditing: false,
  isBlurred: false
};

let validationState: ValidationState = {
  nameError: '',
  emailError: '',
  phoneError: '',
  generalError: ''
};

// URL Slug Generation
$: formState.urlSlug = generateUrlSlug(formState.tributeName);

function generateUrlSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .trim()
    .replace(/^-+|-+$/g, '');
}

// Authentication Utilities
function generateSecurePassword(): string {
  return Math.random().toString(36).slice(-12);
}

function validateJwtToken(token: string): boolean {
  return token?.split('.').length === 3;
}

// User Registration Flow
async function registerNewUser(): Promise<string> {
  const password = generateSecurePassword();
  
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: formState.username,
        email: formState.userEmail,
        password
      }),
      mode: 'cors'
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    await sendWelcomeEmail(formState.username, formState.userEmail, password);
    return password;
  } catch (error) {
    throw new Error('User registration failed');
  }
}

// Email Service
async function sendWelcomeEmail(username: string, email: string, password: string): Promise<void> {
  const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SEND_EMAIL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
    mode: 'cors'
  });

  if (!response.ok) {
    throw new Error('Failed to send welcome email');
  }
}

// Authentication Service
async function authenticateUser(username: string, password: string): Promise<string> {
  const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  if (!response.ok) {
    throw new Error('Authentication failed');
  }

  const { token } = await response.json();
  
  if (!validateJwtToken(token)) {
    throw new Error('Invalid authentication token');
  }

  localStorage.setItem('jwtToken', token);
  return token;
}
// Page Creation Service
async function createTributePage(token: string): Promise<number> {
  // Get security nonce
  const nonceResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_NONCE}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const { nonce } = await nonceResponse.json();

  // Create the tribute page
  const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CREATE_PAGE}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-WP-Nonce': nonce
    },
    body: JSON.stringify({
      title: formState.tributeName,
      content: `Celebration of Life tribute page for ${formState.tributeName}`
    })
  });

  if (!response.ok) {
    throw new Error('Failed to create tribute page');
  }

  const { page_id } = await response.json();
  return page_id;
}

// Username Management
async function generateUniqueUsername(email: string): Promise<string> {
  const baseUsername = email.split('@')[0].replace(/[^a-z0-9_]/g, '');
  
  const isAvailable = await checkUsernameAvailability(baseUsername);
  if (isAvailable) return baseUsername;

  let suffix = 1;
  let username = `${baseUsername}_${suffix}`;
  
  while (!(await checkUsernameAvailability(username))) {
    suffix++;
    username = `${baseUsername}_${suffix}`;
  }

  return username;
}

async function checkUsernameAvailability(username: string): Promise<boolean> {
  const response = await fetch(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHECK_USERNAME}?username=${username}`
  );
  const { exists } = await response.json();
  return !exists;
}

// Form Validation
function validateForm(): boolean {
  let isValid = true;
  validationState = {
    nameError: '',
    emailError: '',
    phoneError: '',
    generalError: ''
  };

  if (!formState.userFullName.trim()) {
    validationState.nameError = 'Name is required';
    isValid = false;
  }

  if (!formState.userEmail.trim()) {
    validationState.emailError = 'Email is required';
    isValid = false;
  } else if (!isValidEmail(formState.userEmail)) {
    validationState.emailError = 'Please enter a valid email';
    isValid = false;
  }

  if (!formState.userPhone.trim()) {
    validationState.phoneError = 'Phone number is required';
    isValid = false;
  }

  return isValid;
}

// Event Handlers
async function handleTributeCreation() {
  if (!validateForm()) return;

  uiState.isLoading = true;
  try {
    const password = await registerNewUser();
    const token = await authenticateUser(formState.username, password);
    const pageId = await createTributePage(token);

    await registerPageInSystem(pageId);
    redirectToTributePage(formState.urlSlug);
  } catch (error) {
    handleError(error);
  } finally {
    uiState.isLoading = false;
  }
}

function handleStepNavigation(direction: 'next' | 'back') {
  if (direction === 'next' && !formState.tributeName) {
    validationState.generalError = "Please enter your loved one's name";
    return;
  }

  uiState.currentStep = direction === 'next' ? 2 : 1;
  uiState.isBlurred = direction === 'next';
}

// Utility Functions
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function registerPageInSystem(pageId: number): Promise<void> {
  await fetch('/api/add-page', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug: formState.urlSlug, isV2: true })
  });
}

function redirectToTributePage(slug: string): void {
  window.location.href = `https://tributestream.com/${slug}`;
}

function handleError(error: Error): void {
  if (error.message.includes('email')) {
    validationState.emailError = 'Email already registered';
  } else if (error.message.includes('username')) {
    validationState.nameError = 'Username already taken';
  } else {
    validationState.generalError = 'An error occurred. Please try again.';
  }
}

onMount(() => {
  // Initialize any required resources
});
<main class="overflow-hidden">
    <section class="relative bg-gray-900 text-white">
      <!-- Video Background -->
      <video
        autoplay
        muted
        loop
        playsinline
        class="absolute inset-0 w-full h-full object-cover z-0"
        class:blurred={uiState.isBlurred}
      >
        <source
          src="https://pub-f5d8194fe58b4bb69fc710f4fecb334f.r2.dev/video.mp4"
          type="video/mp4"
        />
      </video>
      
      <!-- Overlay -->
      <div class="absolute inset-0 bg-black opacity-50 z-10"></div>
  
      <!-- Content Container -->
      <div class="relative z-20 flex flex-col items-center justify-start h-screen min-w-screen pt-8 font-['Fanwood_Text']">
        <h1 class="text-4xl md:text-6xl text-center mb-4">
          We Connect Families, One Link at a Time.
        </h1>
  
        <!-- Step 1: Initial Form -->
        {#if uiState.currentStep === 1}
          <TributeInitialForm
            bind:tributeName={formState.tributeName}
            error={validationState.generalError}
            onSubmit={() => handleStepNavigation('next')}
            onSearch={handleSearch}
          />
        
        <!-- Step 2: Details Form -->
        {:else}
          <TributeDetailsForm
            {formState}
            {validationState}
            {uiState}
            onBack={() => handleStepNavigation('back')}
            onSubmit={handleTributeCreation}
          />
        {/if}
      </div>
    </section>
  </main>
  
  <!-- Component Definitions -->
  <script context="module">
    const TributeInitialForm = ({tributeName, error, onSubmit, onSearch}) => (`
      <form on:submit|preventDefault={onSubmit}>
        <div class="flex flex-col items-center justify-center mb-4">
          <p class="text-center mb-8">
            Tributestream broadcasts high quality audio and video of your loved
            one's celebration of life. Enter your loved one's name below to begin.
          </p>
          
          <input
            type="text"
            placeholder="Loved One's Name Here"
            class="w-full px-4 py-2 text-gray-900 rounded-md mb-4 text-center max-w-md"
            class:invalid-input={!!error}
            bind:value={tributeName}
          />
          
          {#if error}
            <p class="error-text">{error}</p>
          {/if}
  
          <div class="flex space-x-4 justify-center">
            <button type="submit" class="tribute-button">
              Create Tribute
            </button>
            <button on:click={onSearch} class="tribute-button">
              Search Streams
            </button>
          </div>
        </div>
      </form>
    `);
  
    const TributeDetailsForm = ({
      formState,
      validationState,
      uiState,
      onBack,
      onSubmit
    }) => (`
      <div class="w-full max-w-md">
        <div class="mb-4">
          <h2 class="text-xl mb-2">Your Loved One's Custom Link:</h2>
          <UrlEditor
            slug={formState.urlSlug}
            isEditing={uiState.isEditing}
          />
        </div>
  
        <FormFields
          formState={formState}
          validationState={validationState}
        />
  
        <div class="flex justify-between items-center">
          <button
            type="button"
            on:click={onBack}
            class="back-button"
          >
            <i class="fas fa-arrow-left"></i>
          </button>
  
          <button
            type="button"
            on:click={onSubmit}
            class="tribute-button"
            disabled={uiState.isLoading}
          >
            {uiState.isLoading ? 'Creating...' : 'See Custom Link'}
          </button>
        </div>
      </div>
    `);
  </script>
  
  <style>
    .tribute-button {
      @apply bg-[#D5BA7F] text-black font-bold py-2 px-4 border border-transparent rounded-lg;
      @apply hover:text-black hover:shadow-[0_0_10px_4px_#D5BA7F];
      @apply transition-all duration-300 ease-in-out;
    }
  
    .invalid-input {
      @apply border-2 border-red-500;
      animation: shake 0.5s ease-in-out;
    }
  
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-10px); }
      75% { transform: translateX(10px); }
    }
  
    .blurred {
      @apply filter blur-[10px] transition-all duration-300;
    }
  </style>
  

  