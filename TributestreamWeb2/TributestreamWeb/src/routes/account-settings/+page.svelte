<script lang="ts">
  import { preventDefault } from 'svelte/legacy';

  let { data = {} } = $props();
    const { userData = {} } = data;

    let email = $state(userData.email || '');
    let phoneNumber = $state(userData.phone_number || '');
    let customLink = $state(userData.custom_link || '');
    let password = $state('********'); // Placeholder for security
  // Function to handle form submission (currently placeholder)
  function handleSubmit() {
    // Implement logic to save the form changes (API call)
    console.log('Form submitted');
  }

  // Function to handle logout
  function handleLogout() {
    localStorage.removeItem('jwtToken'); // Clear the token
    window.location.href = '/login'; // Redirect to login page
  }
    
</script>


<main class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Account Settings</h1>
    <form onsubmit={preventDefault(handleSubmit)} class="space-y-4">
        <div>
            <label for="email" class="block mb-2">Email:</label>
            <input type="email" id="email" bind:value={email} class="w-full p-2 border rounded" />
        </div>
        <div>
            <label for="phoneNumber" class="block mb-2">Phone Number:</label>
            <input type="tel" id="phoneNumber" bind:value={phoneNumber} class="w-full p-2 border rounded" />
        </div>
        <div>
            <label for="customLink" class="block mb-2">Custom Link:</label>
            <input type="text" id="customLink" bind:value={customLink} class="w-full p-2 border rounded" readonly />
        </div>
        <div>
            <label for="password" class="block mb-2">Password:</label>
            <input type="password" id="password" bind:value={password} class="w-full p-2 border rounded" readonly />
            <button type="button" class="mt-2 text-blue-500">Change Password</button>
        </div>
        <button type="submit"   class="bg-[#D5BA7F] text-black font-bold py-2 px-4 border border-transparent rounded-lg hover:text-black hover:shadow-[0_0_10px_4px_#D5BA7F] transition-all duration-300 ease-in-out">Save Changes</button>
    </form>
    <button type="button" onclick={handleLogout} class="bg-[#D5BA7F] text-black font-bold py-2 px-4 border border-transparent rounded-lg hover:text-black hover:shadow-[0_0_10px_4px_#D5BA7F] transition-all duration-300 ease-in-out">Log Out</button>
    
</main>
