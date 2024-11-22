<script>
    export let lovedOneName = 'Loved One Name'; // Replace with dynamic data
    export let livestreamSet = false; // Boolean to indicate livestream status
    export let displayName = 'Display Name'; // Replace with dynamic data
    export let createdOn = '2024-11-11'; // Replace with dynamic data
    export let modifiedOn = '2024-11-12'; // Replace with dynamic data
    export let livestreamId = 0;
    let showPrompt = false;
    let custom_html = '';

    function handleLivestreamClick() {
        showPrompt = true;
    }
    async function updateCustomHtml() {
        try {
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/tribute/update-html/${livestreamId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    displayName,
                    custom_html
                })
            });
            
            if (response.ok) {
                showPrompt = false;
                // Optionally add a success message
            }
        } catch (error) {
            console.error('Failed to update custom HTML:', error);
        }
    }
  </script>
  
  <div class="card p-4 bg-white shadow rounded">
    <h2>{lovedOneName}</h2>
    <button 
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        on:click={handleLivestreamClick}
    >
        {livestreamSet ? 'Update Livestream' : 'Set Livestream'}
    </button>

    {#if showPrompt}
        <div class="modal mt-4">
            <textarea
                bind:value={custom_html}
                class="w-full p-2 border rounded"
                placeholder="Enter custom HTML here..."
            ></textarea>
            <button 
                class="mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                on:click={updateCustomHtml}
            >
                Save Changes
            </button>
        </div>
    {/if}
    
  
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
  