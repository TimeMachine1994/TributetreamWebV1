<script>
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
</script>

<div class="flex h-screen bg-gray-100">
  <!-- Sidebar -->
  <aside class="w-64 bg-white shadow-md">
      <div class="p-4">
          <h1 class="text-2xl font-bold text-gray-800">Tributestream Dashboard</h1>
      </div>
      <nav class="p-4">
          <ul class="space-y-2">
              <li>
                  <a 
                      href="/admin" 
                      class="flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded"
                  >
                      <span class="ml-3">Dashboard</span>
                  </a>
              </li>
              <li>
                  <a 
                      href="/admin/pages" 
                      class="flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded"
                  >
                      <span class="ml-3">Celebration Pages</span>
                  </a>
              </li>
              <li>
                  <a 
                      href="/admin/users" 
                      class="flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded"
                  >
                      <span class="ml-3">Users</span>
                  </a>
              </li>
              <li>
                  <a 
                      href="/admin/settings" 
                      class="flex items-center p-2 text-gray-700 hover:bg-gray-200 rounded"
                  >
                      <span class="ml-3">Settings</span>
                  </a>
              </li>
          </ul>
      </nav>
  </aside>

  <!-- Main Content Area -->
  <main class="flex-1 overflow-x-hidden overflow-y-auto">
      <slot />
  </main>
</div>

<style>
  :global(html, body) {
      height: 100%;
      margin: 0;
  }
</style>
