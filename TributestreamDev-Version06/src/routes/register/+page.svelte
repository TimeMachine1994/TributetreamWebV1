<script lang="ts">
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';
    import type { ActionData } from './+page.server';

    /**
     * Component state and form data
     * @type {ActionData | undefined} Form data returned from server actions
     */
    let { form } = $props<{ form: ActionData | undefined }>();
    
    /**
     * Loading state to indicate form submission is in progress
     */
    let loading = $state(false);
    
    /**
     * Form field values for validation
     */
    let password = $state('');
    let confirmPassword = $state('');
    
    /**
     * Derived value to check if passwords match
     */
    let passwordsMatch = $derived(password === confirmPassword);
    
    /**
     * Flag to show success message after registration
     */
    let registrationSuccess = $state(false);

    /**
     * User role options available for registration
     */
    const roleOptions = [
        { value: 'Family Contact', label: 'Family Contact' },
        { value: 'Funeral Director', label: 'Funeral Director' },
        { value: 'Guest', label: 'Guest' }
    ];

    /**
     * Form submission handler with SvelteKit enhance
     * Manages loading state, validation, and redirect after successful registration
     * @returns {Function} Enhanced form submission handler
     */
    function handleSubmit() {
        // Set loading state
        loading = true;
        
        // Return the enhanced form submission handler
        return async ({ update, result }: { update: () => Promise<void>, result: { type: string, data?: any } }) => {
            await update();
            
            console.log('🔄 Processing registration result:', result);
            
            if (result.type === 'success' && result.data?.success) {
                console.log('✅ Registration successful!', {
                    email: result.data.user?.email,
                    role: result.data.user?.role
                });
                
                // Show success message and prepare for redirection
                registrationSuccess = true;
                
                // Redirect to login page after a short delay
                setTimeout(() => {
                    goto('/login');
                }, 3000);
            } else {
                console.error('❌ Registration failed:', {
                    resultType: result.type,
                    error: result.data?.error || 'Unknown error'
                });
            }
            
            loading = false;
        };
    }

    /**
     * Password validation function
     * Ensures password meets minimum length requirement
     * @returns {boolean} True if password is valid
     */
    function validatePassword() {
        return password.length >= 8;
    }
</script>

<svelte:head>
    <title>Register | Tributestream</title>
    <meta name="description" content="Create a new Tributestream account to manage memorial services and tributes." />
</svelte:head>

<div class="flex min-h-screen items-center justify-center">
    <div class="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 class="text-2xl font-bold text-center">Create an Account</h1>
        
        {#if registrationSuccess}
            <div class="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg" role="alert">
                <span class="font-medium">Registration successful!</span> Redirecting to login page...
            </div>
        {:else}
            <form 
                method="POST" 
                use:enhance={handleSubmit}
                class="space-y-4"
                aria-labelledby="registration-form"
            >
                <div>
                    <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
                    <input 
                        type="text"
                        id="username" 
                        name="username" 
                        value={form?.username ?? ''}
                        required 
                        minlength="3"
                        aria-describedby="username-error"
                        class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                    {#if form?.errors?.username}
                        <p id="username-error" class="mt-1 text-sm text-red-600">{form.errors.username}</p>
                    {/if}
                </div>
                
                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                    <input 
                        type="email"
                        id="email" 
                        name="email" 
                        value={form?.email ?? ''}
                        required 
                        aria-describedby="email-error"
                        class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                    {#if form?.errors?.email}
                        <p id="email-error" class="mt-1 text-sm text-red-600">{form.errors.email}</p>
                    {/if}
                </div>
                
                <div>
                    <label for="role" class="block text-sm font-medium text-gray-700">I am a</label>
                    <select
                        id="role"
                        name="role"
                        required
                        aria-describedby="role-error"
                        class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    >
                        <option value="" disabled selected>Select your role</option>
                        {#each roleOptions as option}
                            <option value={option.value}>{option.label}</option>
                        {/each}
                    </select>
                    {#if form?.errors?.role}
                        <p id="role-error" class="mt-1 text-sm text-red-600">{form.errors.role}</p>
                    {/if}
                </div>
                
                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password"
                        bind:value={password}
                        required 
                        minlength="8"
                        aria-describedby="password-requirements password-error"
                        class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none
                        {!validatePassword() && password ? 'border-red-300' : ''}"
                    />
                    <p id="password-requirements" class="mt-1 text-xs text-gray-500">
                        Password must be at least 8 characters long
                    </p>
                    {#if password && !validatePassword()}
                        <p id="password-error" class="mt-1 text-sm text-red-600">Password must be at least 8 characters</p>
                    {/if}
                    {#if form?.errors?.password}
                        <p class="mt-1 text-sm text-red-600">{form.errors.password}</p>
                    {/if}
                </div>
                
                <div>
                    <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm Password</label>
                    <input 
                        type="password" 
                        id="confirmPassword" 
                        bind:value={confirmPassword}
                        required 
                        aria-describedby="confirm-password-error"
                        class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none
                        {confirmPassword && !passwordsMatch ? 'border-red-300' : ''}"
                    />
                    {#if confirmPassword && !passwordsMatch}
                        <p id="confirm-password-error" class="mt-1 text-sm text-red-600">Passwords do not match</p>
                    {/if}
                </div>

                {#if form?.message}
                    <div role="alert" class="p-3 text-red-500 text-sm bg-red-50 rounded-md">{form.message}</div>
                {/if}
                
                <button 
                    type="submit" 
                    class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    disabled={loading || !!(confirmPassword && !passwordsMatch) || !!(password && !validatePassword())}
                    aria-disabled={loading || !!(confirmPassword && !passwordsMatch) || !!(password && !validatePassword())}
                >
                    {#if loading}
                        <span class="inline-block mr-2">
                            <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </span>
                        Creating account...
                    {:else}
                        Create Account
                    {/if}
                </button>
            </form>
            
            <div class="text-center text-sm">
                <span class="text-gray-600">Already have an account?</span>
                <a href="/login" class="text-blue-600 hover:text-blue-800 font-medium">Sign in</a>
            </div>
        {/if}
    </div>
</div>