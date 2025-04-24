<script lang="ts">
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';
    import type { ActionData } from './$types';
    import { setUser } from '$lib/stores/auth.store.svelte';

    let { form } = $props<{ form: ActionData }>();
    let loading = $state(false);

    function handleSubmit() {
        loading = true;
        return async ({ update, result }: { update: () => Promise<void>, result: { type: string, data?: any } }) => {
            await update();
            
            // If login was successful, handle role-based routing
            if (result.type === 'success' && result.data?.success) {
                console.log('🔐 Login successful!', result.data);
                
                // Update the auth store with user data
                if (result.data.user) {
                    setUser({
                        ...result.data.user,
                        authenticated: true
                    });
                    
                    // Get user role and determine redirect path
                    const userRole = result.data.user.role?.name;
                    console.log('👤 User role:', userRole);
                    
                    let redirectPath = '/protected/profile'; // Default path
                    
                    // Determine redirect based on role
                    switch(userRole?.toLowerCase()) {
                        case 'admin':
                            redirectPath = '/admin-dashboard';
                            break;
                        case 'funeral director':
                            redirectPath = '/funeral-director-portal';
                            break;
                        case 'family contact':
                            redirectPath = '/family-dashboard';
                            break;
                        default:
                            console.log('⚠️ Unknown or undefined role:', userRole);
                            // Use default path for unknown roles
                    }
                    
                    console.log('🔄 Redirecting to:', redirectPath);
                    goto(redirectPath);
                }
            } else {
                console.log('❌ Login failed:', result);
            }
            
            loading = false;
        };
    }
</script>

<div class="flex min-h-screen items-center justify-center">
    <div class="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 class="text-2xl font-bold text-center">Login</h1>
        
        <form 
            method="POST" 
            use:enhance={handleSubmit}
            class="space-y-4"
        >
            <div>
                <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                <input 
                
                    id="email" 
                    name="email" 
                    value={form?.email ?? ''}
                    required 
                    class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                />
            </div>
            
            <div>
                <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                <input 
                    type="password" 
                    id="password" 
                    name="password" 
                    required 
                    class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                />
            </div>

            {#if form?.message}
                <div class="text-red-500 text-sm">{form.message}</div>
            {/if}
            
            <button 
                type="submit" 
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                disabled={loading}
            >
                {#if loading}
                    Signing in...
                {:else}
                    Sign in
                {/if}
            </button>
        </form>
    </div>
</div>
