<script lang="ts">
    import { superForm } from 'sveltekit-superforms';
    import { goto } from '$app/navigation';
    
    let { data } = $props();
    console.log('Initial data received:', data);
    
    const { form, errors, enhance, message } = superForm(data.form, {
        onResult: async ({ result }) => {
            console.log('🚀 onResult triggered');
            console.log('📦 Result type:', result.type);
            console.log('📄 Full result:', result);
            
            if (result.type === 'success') {
                const token = result.data.token;
                // Remove localStorage storage since we're moving to server-side only
                
                // Let the server handle cookie storage via the response headers
                // The cookie will be automatically handled by the browser
                // and subsequent requests will include it
                
                console.log('🚗 Starting navigation to /admin');
                await goto('/dashboard', { replaceState: true });
}
        },
        onSubmit: () => {
            console.log('📝 Form submission started');
            console.log('📋 Form values:', $form);
            return true;
        },
        onUpdate: ({ form }) => {
            console.log('🔄 Form update occurred');
            console.log('📊 Updated form state:', form);
        },
        onError: (err) => {
            console.log('❌ Error occurred during form processing');
            console.log('🐛 Error details:', err);
        }
    });

    console.log('🎯 Form component initialized');
    console.log('🔍 Current form state:', $form);
</script>


<!-- Rest of your template remains the same -->


<div class="flex justify-center items-center min-h-screen">
    <div class="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h1 class="text-2xl font-bold mb-6 text-center">Login</h1>
        
        <form method="POST" use:enhance class="space-y-4">
            <div>
                <label for="username" class="block text-sm font-medium">Username</label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    bind:value={$form.username}
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
                {#if $errors.username}
                    <p class="text-red-500 text-sm mt-1">{$errors.username}</p>
                {/if}
            </div>

            <div>
                <label for="password" class="block text-sm font-medium">Password</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    bind:value={$form.password}
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
                {#if $errors.password}
                    <p class="text-red-500 text-sm mt-1">{$errors.password}</p>
                {/if}
            </div>

            <button
                type="submit"
                class="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
                Login
            </button>
        </form>

        {#if $message}
            <p class="mt-4 text-center text-green-600">{$message}</p>
        {/if}
    </div>
</div>
