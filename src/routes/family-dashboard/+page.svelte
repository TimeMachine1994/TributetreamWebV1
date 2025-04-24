<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  
  let user = $state(null);
  
  $effect(() => {
    console.log('👨‍👩‍👧‍👦 Family Dashboard - Checking user role...', page.data.user);
    
    if (!page.data.user) {
      console.log('⚠️ No user found, redirecting to login');
      goto('/login');
      return;
    }
    
    if (page.data.user.role !== 'family') {
      console.log('🚫 Unauthorized access attempt - Not a family member');
      goto('/unauthorized');
      return;
    }
    
    user = page.data.user;
    console.log('✅ Family member access verified');
  });
</script>

<div class="container mx-auto p-8">
  <h1 class="text-3xl font-bold mb-8">Family Dashboard</h1>
  
  {#if user}
    <div class="bg-white p-6 rounded-lg shadow-lg mb-8">
      <h2 class="text-xl font-semibold mb-4">Welcome, {user.username}!</h2>
      <p class="text-gray-600">Family Contact for Memorial Tributes</p>
    </div>

    <nav class="grid grid-cols-2 gap-4 mb-8">
      <a href="/tributes/view" class="p-4 bg-blue-100 rounded-lg hover:bg-blue-200">
        <h3 class="font-semibold">View Tributes</h3>
        <p class="text-sm text-gray-600">Access memorial tributes</p>
      </a>
      
      <a href="/memories/share" class="p-4 bg-blue-100 rounded-lg hover:bg-blue-200">
        <h3 class="font-semibold">Share Memories</h3>
        <p class="text-sm text-gray-600">Add photos and memories</p>
      </a>
      
      <a href="/guest-book" class="p-4 bg-blue-100 rounded-lg hover:bg-blue-200">
        <h3 class="font-semibold">Guest Book</h3>
        <p class="text-sm text-gray-600">View and manage condolences</p>
      </a>
      
      <a href="/family/invite" class="p-4 bg-blue-100 rounded-lg hover:bg-blue-200">
        <h3 class="font-semibold">Invite Family</h3>
        <p class="text-sm text-gray-600">Share access with family members</p>
      </a>
    </nav>

    <div class="bg-gray-50 p-6 rounded-lg">
      <h3 class="font-semibold mb-2">Need Help?</h3>
      <p class="text-sm text-gray-600">Contact your funeral director for assistance with managing your memorial tribute.</p>
    </div>
  {/if}
</div>