<script lang="ts">
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';
    import type { ActionData } from './$types';
    import { setUser } from '$lib/stores/auth.store.svelte';
    import type { UserRole } from '$lib/auth/types';

    let { form } = $props<{ form: ActionData }>();
    let loading = $state(false);

    function handleSubmit() {
        loading = true;
        return async ({ update, result }: { update: () => Promise<void>, result: { type: string, data?: any } }) => {
            await update();
            
            console.log('🔄 Processing login result:', result);
            
            if (result.type === 'success' && result.data?.success) {
                console.log('✅ Login successful!', {
                    userId: result.data.user?.id,
                    email: result.data.user?.email
                });
                
                if (result.data.user) {
                    // The API now returns a structured user object with role already extracted
                    console.log('👤 Complete user data:', JSON.stringify(result.data.user, null, 2));
                    
                    // Set user in the auth store with the full structured user object
                    setUser(result.data.user);
                    
                    // Get the role directly from the structured response
                    const userRole = result.data.user.role;
                    console.log('🎭 User role:', userRole);
                    
                    let redirectPath = '/protected/profile'; // Default path
                    
                    // Case-insensitive role comparison function
                    const roleCheck = (role: string) =>
                        userRole?.toLowerCase() === role.toLowerCase();
                    
                    // Map roles to redirect paths
                    if (roleCheck('admin')) {
                        console.log('👑 Admin role detected - redirecting to admin dashboard');
                        redirectPath = '/admin/tributes'; // Admin section with tributes list
                    } else if (roleCheck('funeral director')) {
                        console.log('⚰️ Funeral Director role detected - redirecting to funeral director portal');
                        redirectPath = '/funeral-director-portal';
                    } else if (roleCheck('family contact')) {
                        console.log('👨‍👩‍👧‍👦 Family Contact role detected - redirecting to family dashboard');
                        redirectPath = '/family-dashboard';
                    } else {
                        console.warn('⚠️ Unknown or invalid role:', {
                            role: userRole,
                            fallbackPath: redirectPath
                        });
                    }
                    
                    console.log('🔄 Starting redirect to:', redirectPath);
                    goto(redirectPath);
                } else {
                    console.error('❌ Login successful but no user data received');
                }
            } else {
                console.error('❌ Login failed:', {
                    resultType: result.type,
                    error: result.data?.error || 'Unknown error'
                });
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
                    type="email"
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
