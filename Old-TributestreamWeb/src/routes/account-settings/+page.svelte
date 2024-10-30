<script>
    export let data = {};
    const { userData = {} } = data;

    let email = userData.email || '';
    let phoneNumber = userData.phone_number || '';
    let customLink = userData.custom_link || '';
    let password = '********'; // Placeholder for security
</script>


<main class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Account Settings</h1>
    <form on:submit|preventDefault={handleSubmit} class="space-y-4">
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
        <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">Save Changes</button>
    </form>
    <button type="button" on:click={handleLogout} class="mt-4 bg-red-500 text-white px-4 py-2 rounded">Log Out</button>
    
</main>
