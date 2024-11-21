<script>
    export let lovedOneName = 'Loved One Name'; // Replace with dynamic data
    export let livestreamSet = 'false'; // Boolean to indicate livestream status
    export let displayName = 'Display Name'; // Replace with dynamic data
    export let createdOn = '2024-11-11'; // Replace with dynamic data
    export let modifiedOn = '2024-11-12'; // Replace with dynamic data
  </script>
  
  <div class="p-6 border rounded-lg shadow-lg bg-white grid grid-cols-1 md:grid-cols-3 gap-4">
    <!-- Loved One's Name -->
    <div class="col-span-2 flex items-center bg-gray-50 rounded-lg p-4">
      <h1 class="text-3xl font-semibold text-gray-800 italic">{lovedOneName}</h1>
    </div>
  
    <!-- Livestream Status -->
    <div class="flex items-center justify-center bg-gray-50 rounded-lg p-4">
      <p class="text-lg font-medium text-gray-600">
        Livestream: 
        <span class={`font-bold ${livestreamSet ? 'text-green-600' : 'text-red-600'}`}>
          {livestreamSet ? 'Yes' : 'No'}
        </span>
      </p>
    </div>
  
    <!-- Additional Details -->
    <div class="col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Display Name -->
      <div class="bg-gray-50 rounded-lg p-4">
        <p class="text-sm text-gray-500">Display Name</p>
        <p class="text-lg font-medium text-gray-800">{displayName}</p>
      </div>
  
      <!-- Created On -->
      <div class="bg-gray-50 rounded-lg p-4">
        <p class="text-sm text-gray-500">Created On</p>
        <p class="text-lg font-medium text-gray-800">{createdOn}</p>
      </div>
  
      <!-- Modified On -->
      <div class="bg-gray-50 rounded-lg p-4">
        <p class="text-sm text-gray-500">Modified On</p>
        <p class="text-lg font-medium text-gray-800">{modifiedOn}</p>
      </div>
    </div>
  </div>
  