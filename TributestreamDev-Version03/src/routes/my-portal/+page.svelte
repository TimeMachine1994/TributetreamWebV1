<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import { message } from 'sveltekit-superforms/client';
  import type { PageData } from './$types';

  let { data } = $props<{ data: PageData }>();
  
  // Initialize the forms
  const { form: subscriptionForm, errors: subscriptionErrors, enhance: subscriptionEnhance, message: subscriptionMessage } = superForm(data.subscriptionForm ?? {}, {
    resetForm: true,
    taintedMessage: false,
    onUpdate: ({ form }) => {
      if (form.valid) {
        emailInput = '';
      }
    }
  });
  
  const { form: loginForm, errors: loginErrors, enhance: loginEnhance, message: loginMessage } = superForm(data.loginForm ?? {}, {
    resetForm: false,
    taintedMessage: false
  });
  
  // Form states
  let emailInput = $state('');
  let usernameInput = $state('');
  let passwordInput = $state('');
  let isSubscribing = $state(false);
  let isLoggingIn = $state(false);
  
  // Tab state for mobile view
  let activeTab = $state<'login' | 'subscribe'>('login');
</script>

<svelte:head>
  <title>Member Portal | Tributestream</title>
  <meta name="description" content="Log in to your Tributestream account or sign up for notifications." />
</svelte:head>

<div class="container min-h-screen px-4 py-16 mx-auto flex flex-col items-center justify-center">
  <div class="max-w-4xl w-full bg-white rounded-lg shadow-lg overflow-hidden">
    <!-- Header with Logo -->
    <div class="px-6 py-8 text-center border-b border-gray-200 bg-primary/5">
      <h1 class="text-3xl md:text-4xl font-bold mb-4 text-primary">
        Tributestream Member Portal
      </h1>
      <p class="text-gray-600 max-w-2xl mx-auto">
        Access your personal Tributestream account to manage memorial tributes, view analytics, and customize your pages.
      </p>
    </div>
    
    <!-- Tabs for mobile -->
    <div class="md:hidden flex border-b border-gray-200">
      <button 
        class="flex-1 py-3 px-4 font-medium text-center {activeTab === 'login' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}"
        on:click={() => activeTab = 'login'}
      >
        Log In
      </button>
      <button 
        class="flex-1 py-3 px-4 font-medium text-center {activeTab === 'subscribe' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}"
        on:click={() => activeTab = 'subscribe'}
      >
        Subscribe
      </button>
    </div>
    
    <!-- Main Content - Split into two columns on desktop -->
    <div class="md:flex">
      <!-- Login Form (Left Column) -->
      <div class="md:w-1/2 p-6 md:p-8 {activeTab === 'login' ? 'block' : 'hidden md:block'}">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-800">Log In</h2>
          <p class="text-gray-600 mt-1">Access your personal Tributestream account</p>
        </div>
        
        {#if data.errorMessage}
          <div class="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
            {data.errorMessage}
          </div>
        {/if}
        
        <form method="POST" action="?/login" use:loginEnhance class="space-y-4">
          <div>
            <label for="username" class="block text-sm font-medium mb-2 text-gray-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              bind:value={usernameInput}
              placeholder="Your username or email"
              class="w-full px-4 py-3 rounded-md border bg-white text-gray-800 focus:ring-2 focus:ring-primary focus:outline-none"
              required
            />
            {#if $loginErrors.username}
              <p class="mt-1.5 text-sm text-red-600">{$loginErrors.username}</p>
            {/if}
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium mb-2 text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              bind:value={passwordInput}
              placeholder="Your password"
              class="w-full px-4 py-3 rounded-md border bg-white text-gray-800 focus:ring-2 focus:ring-primary focus:outline-none"
              required
            />
            {#if $loginErrors.password}
              <p class="mt-1.5 text-sm text-red-600">{$loginErrors.password}</p>
            {/if}
          </div>
          
          {#if $loginMessage?.text}
            <div class="p-3 rounded-md text-center {$loginMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
              {$loginMessage.text}
            </div>
          {/if}
          
          <button
            type="submit"
            class="w-full py-3 px-6 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
      
      <!-- Divider -->
      <div class="hidden md:block w-px bg-gray-200"></div>
      
      <!-- Subscribe Form (Right Column) -->
      <div class="md:w-1/2 p-6 md:p-8 bg-gray-50 {activeTab === 'subscribe' ? 'block' : 'hidden md:block'}">
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-800">Coming Soon!</h2>
          <p class="text-gray-600 mt-1">Get notified when new features are available.</p>
        </div>
        
        <form method="POST" action="?/subscribe" use:subscriptionEnhance class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium mb-2 text-gray-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              bind:value={emailInput}
              placeholder="Enter your email"
              class="w-full px-4 py-3 rounded-md border bg-white text-gray-800 focus:ring-2 focus:ring-primary focus:outline-none"
              required
            />
            {#if $subscriptionErrors.email}
              <p class="mt-1.5 text-sm text-red-600">{$subscriptionErrors.email}</p>
            {/if}
          </div>
          
          {#if $subscriptionMessage?.text}
            <div class="p-3 rounded-md text-center {$subscriptionMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
              {$subscriptionMessage.text}
            </div>
          {/if}
          
          <button
            type="submit"
            class="w-full py-3 px-6 bg-primary/80 text-primary-foreground font-medium rounded-md hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
            disabled={isSubscribing}
          >
            {isSubscribing ? 'Subscribing...' : 'Notify me when available'}
          </button>
        </form>
        
        <div class="mt-6 text-sm text-gray-500">
          <p>Stay connected with Tributestream! Subscribe to be notified about:</p>
          <ul class="list-disc pl-5 mt-2 space-y-1">
            <li>New memorial features</li>
            <li>Enhanced customization options</li>
            <li>Mobile app releases</li>
            <li>Special promotions</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>