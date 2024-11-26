<script>
    export let data; // In case you use a layout load function for shared data
  </script>
  
  <div class="flex min-h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside class="w-64 bg-white shadow-md hidden md:block">
      <nav class="flex flex-col h-full">
        <!-- Logo Section -->
        <div class="flex items-center justify-center h-16 bg-blue-500 text-white font-bold text-lg">
          Tributestream
        </div>
        <!-- Navigation Links -->
        <ul class="flex flex-col py-4">
          <li>
            <a
              href="/dashboard"
              class="block py-2 px-4 hover:bg-gray-200 text-gray-700 font-medium"
            >
              Dashboard
            </a>
          </li>
          <li>
            <a
              href="/dashboard/tributestream-archive"
              class="block py-2 px-4 hover:bg-gray-200 text-gray-700 font-medium"
            >
            Tributestream Archive
            </a>
          </li>
          <li>
            <a
              href="/dashboard/create-tributestream"
              class="block py-2 px-4 hover:bg-gray-200 text-gray-700 font-medium"
            >
            Create Tributestream
        </a>
          </li>
          <li>
            <a
              href="/dashboard/collaborators"
              class="block py-2 px-4 hover:bg-gray-200 text-gray-700 font-medium"
            >
              Collaborators
            </a>
          </li>
          <li>
            <a
              href="/dashboard/payments"
              class="block py-2 px-4 hover:bg-gray-200 text-gray-700 font-medium"
            >
              Payments
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  
    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col">
      <!-- Top Bar -->
      <header class="bg-white shadow-md">
        <div class="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 class="text-lg font-bold text-gray-700">
            Dashboard
          </h1>
          <div>
            <!-- Placeholder for future actions like profile or logout -->
            <a href="/logout" class="text-blue-500 hover:text-blue-700">Logout</a>
          </div>
        </div>
      </header>
  
      <!-- Main Content -->
      <main class="flex-1 container mx-auto px-4 py-6">
        <slot /> <!-- Render the page content -->
      </main>
    </div>
  </div>
  