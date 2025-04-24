<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  
  let user = $state(null);
  
  $effect(() => {
    console.log('🔒 Admin Dashboard - Checking user role...', page.data.user);
    
    if (!page.data.user) {
      console.log('⚠️ No user found, redirecting to login');
      goto('/login');
      return;
    }
    
    if (page.data.user.role !== 'admin') {
      console.log('🚫 Unauthorized access attempt - Not an admin');
      goto('/unauthorized');
      return;
    }
    
    user = page.data.user;
    console.log('✅ Admin access verified');
  });
</script>

<div class="container mx-auto p-8">
  <h1 class="text-3xl font-bold mb-8">Admin Dashboard</h1>
  
  {#if user}
    <div class="bg-white p-6 rounded-lg shadow-lg mb-8">
      <h2 class="text-xl font-semibold mb-4">Welcome, {user.username}!</h2>
      <p class="text-gray-600">You are logged in as an Administrator</p>
    </div>

    <nav class="grid grid-cols-2 gap-4 mb-8">
      <a href="/admin/funeral-homes" class="p-4 bg-blue-100 rounded-lg hover:bg-blue-200">
        <h3 class="font-semibold">Funeral Homes</h3>
        <p class="text-sm text-gray-600">Manage funeral home partners</p>
      </a>
      
      <a href="/admin/packages" class="p-4 bg-blue-100 rounded-lg hover:bg-blue-200">
        <h3 class="font-semibold">Packages</h3>
        <p class="text-sm text-gray-600">Configure service packages</p>
      </a>
      
      <a href="/admin/add-ons" class="p-4 bg-blue-100 rounded-lg hover:bg-blue-200">
        <h3 class="font-semibold">Add-ons</h3>
        <p class="text-sm text-gray-600">Manage additional services</p>
      </a>
      
      <a href="/admin/tributes" class="p-4 bg-blue-100 rounded-lg hover:bg-blue-200">
        <h3 class="font-semibold">Tributes</h3>
        <p class="text-sm text-gray-600">View all tributes</p>
      </a>
    </nav>
  {/if}
</div>