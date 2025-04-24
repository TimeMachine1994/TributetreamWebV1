<script>
  import { page } from '$app/state';
  import { goto } from '$app/navigation';

  let userRole = $derived(page.data.user?.role || 'Guest');

  function goHome() {
    console.log('🏠 Navigating to home page');
    goto('/');
  }

  function goBack() {
    console.log('⬅️ Navigating back');
    history.back();
  }

  console.log('🚫 Unauthorized page loaded', { 
    userRole,
    requestedPath: page.url.pathname
  });
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
  <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
    <div class="text-center">
      <h1 class="text-3xl font-bold text-red-600 flex items-center justify-center gap-2">
        <span>🔒</span>
        <span>Unauthorized Access</span>
      </h1>
      
      <div class="mt-4 text-gray-600">
        <p class="text-lg">You don't have permission to access the requested page.</p>
        {#if userRole !== 'Guest'}
          <p class="mt-2 text-sm">
            Current Role: 
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {userRole}
            </span>
          </p>
        {/if}
      </div>
    </div>

    <div class="mt-8 bg-blue-50 rounded-lg p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Need Help?</h2>
      <div class="text-gray-600 space-y-3">
        <p>If you believe you should have access to this page:</p>
        <ul class="list-none space-y-2">
          <li class="flex items-center gap-2">
            <span class="text-blue-500">•</span>
            Verify you're logged in with the correct account
          </li>
          <li class="flex items-center gap-2">
            <span class="text-blue-500">•</span>
            Contact your administrator for access
          </li>
          <li class="flex items-center gap-2">
            <span class="text-blue-500">•</span>
            Email support at 
            <a href="mailto:support@tributestream.com" 
               class="text-blue-600 hover:text-blue-800 hover:underline">
              support@tributestream.com
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div class="mt-8 flex flex-col sm:flex-row gap-4">
      <button
        onclick={goHome}
        class="w-full sm:w-1/2 bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 
               transition-colors duration-200 font-medium focus:outline-none focus:ring-2 
               focus:ring-offset-2 focus:ring-blue-500"
      >
        Return Home
      </button>
      <button
        onclick={goBack}
        class="w-full sm:w-1/2 bg-gray-600 text-white px-4 py-3 rounded-md hover:bg-gray-700 
               transition-colors duration-200 font-medium focus:outline-none focus:ring-2 
               focus:ring-offset-2 focus:ring-gray-500"
      >
        Go Back
      </button>
    </div>
  </div>
</div>