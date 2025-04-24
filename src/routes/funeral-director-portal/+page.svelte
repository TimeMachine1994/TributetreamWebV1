<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  
  let user = $state(null);
  
  $effect(() => {
    console.log('👔 Funeral Director Portal - Checking user role...', page.data.user);
    
    if (!page.data.user) {
      console.log('⚠️ No user found, redirecting to login');
      goto('/login');
      return;
    }
    
    if (page.data.user.role !== 'funeral_director') {
      console.log('🚫 Unauthorized access attempt - Not a funeral director');
      goto('/unauthorized');
      return;
    }
    
    user = page.data.user;
    console.log('✅ Funeral Director access verified');
  });
</script>

<div class="container mx-auto p-8">
  <h1 class="text-3xl font-bold mb-8">Funeral Director Portal</h1>
  
  {#if user}
    <div class="bg-white p-6 rounded-lg shadow-lg mb-8">
      <h2 class="text-xl font-semibold mb-4">Welcome, {user.username}!</h2>
      <p class="text-gray-600">Funeral Director at {user.funeralHome || 'Unassigned'}</p>
    </div>

    <nav class="grid grid-cols-2 gap-4 mb-8">
      <a href="/tributes/new" class="p-4 bg-blue-100 rounded-lg hover:bg-blue-200">
        <h3 class="font-semibold">Create New Tribute</h3>
        <p class="text-sm text-gray-600">Start a new memorial tribute</p>
      </a>
      
      <a href="/tributes/manage" class="p-4 bg-blue-100 rounded-lg hover:bg-blue-200">
        <h3 class="font-semibold">Manage Tributes</h3>
        <p class="text-sm text-gray-600">View and edit existing tributes</p>
      </a>
      
      <a href="/packages/browse" class="p-4 bg-blue-100 rounded-lg hover:bg-blue-200">
        <h3 class="font-semibold">Service Packages</h3>
        <p class="text-sm text-gray-600">Browse available packages</p>
      </a>
      
      <a href="/family-contacts" class="p-4 bg-blue-100 rounded-lg hover:bg-blue-200">
        <h3 class="font-semibold">Family Contacts</h3>
        <p class="text-sm text-gray-600">Manage family member access</p>
      </a>
    </nav>
  {/if}
</div>