<script lang="ts">
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';
    import type { ActionData } from './$types';
    
    export let form: ActionData;
    let isSubmitting = false;

    function handleEnhance() {
        return ({ formElement }) => {
            isSubmitting = true;
            
            return async ({ result }) => {
                isSubmitting = false;
                if (result.type === 'success') {
                    goto('/dashboard');
                }
            };
        };
    }
</script>

<div class="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
    <form 
        method="POST"
        use:enhance={handleEnhance}
        class="space-y-4"
    >
        <h1 class="text-2xl font-bold text-gray-900 mb-6">Login</h1>
        
        <div class="space-y-2">
            <label 
                for="username" 
                class="block text-sm font-medium text-gray-700"
            >
                Username
            </label>
            <input
                type="text"
                id="username"
                name="username"
                value={form?.username ?? ''}
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>

        <div class="space-y-2">
            <label 
                for="password" 
                class="block text-sm font-medium text-gray-700"
            >
                Password
            </label>
            <input
                type="password"
                id="password"
                name="password"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>

        {#if form?.error}
            <div class="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {form.message}
            </div>
        {/if}

        <button
            type="submit"
            disabled={isSubmitting}
            class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
            {isSubmitting ? 'Logging in...' : 'Log In'}
        </button>
    </form>
</div>