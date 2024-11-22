<script lang="ts">
    export let lovedOneName = 'Loved One Name'; // Replace with dynamic data
    export let livestreamSet = 'false'; // Boolean to indicate livestream status
    export let displayName = 'Display Name'; // Replace with dynamic data
    export let createdOn = '2024-11-11'; // Replace with dynamic data
    export let modifiedOn = '2024-11-12'; // Replace with dynamic data
    let showModal = false;
    let codeValue = '';
    export let tributeId = '';
    function toggleModal() {
    showModal = !showModal;
  }
  
  async function getNonce() {
    const response = await fetch('https://wp.tributestream.com/wp-json/tributestream/v1/get-nonce');
    const data = await response.json();
    return data.nonce;
  }
  async function handleSubmit() {
    try {
      const nonce = await getNonce();
       const response = await fetch(`https://wp.tributestream.com/wp-json/tributestream/v1/tribute/custom-html/${tributeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': nonce
        },
        body: JSON.stringify({
          custom_html: codeValue,
          tribute_id: tributeId
        })
      });

      if (response.ok) {
        showModal = false;
      }
    } catch (error) {
      console.error('Error updating livestream status:', error);
    }
  }

  </script>
  
  <div class="p-6 border rounded-lg shadow-lg bg-white grid grid-cols-1 md:grid-cols-3 gap-4">
    <!-- Loved One's Name -->
    <div class="col-span-2 flex items-center bg-gray-50 rounded-lg p-4">
      <h1 class="text-3xl font-semibold text-gray-800 italic">{lovedOneName}</h1>
    </div>
  

    <div class="flex items-center justify-center bg-gray-50 rounded-lg p-4">
      <button
        class="text-lg font-medium text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
        on:click={toggleModal}
      >
        Livestream:
        <span class={`font-bold ${livestreamSet ? 'text-green-600' : 'text-red-600'}`}>
          {livestreamSet ? 'Yes' : 'No'}
        </span>
      </button>
    </div>
    
    {#if showModal}
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-md w-full">
          <h2 class="text-xl font-bold mb-4">Edit Livestream Status</h2>
          
          <form on:submit|preventDefault={handleSubmit} class="flex flex-col flex-grow">
            <div class="flex-grow relative">
              <textarea
                bind:value={codeValue}
                class="w-full h-full resize-none font-mono bg-gray-50 p-4 border rounded-lg"
                style="min-height: calc(11in - 200px); font-size: 14px; line-height: 1.5;"
                spellcheck="false"
                wrap="off"
              ></textarea>
            </div>
            
            <div class="flex justify-end space-x-2 mt-4">
              <button
                type="button"
                class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                on:click={toggleModal}
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </form>
        </div>
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
  