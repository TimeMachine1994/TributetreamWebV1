<script lang="ts">
    import { onMount } from 'svelte';
    import { checkUserRole, isAdmin, parseUserFromCookieString } from '$lib/utils/role-helpers';
    
    /**
     * Props for the RoleBasedAccess component
     */
    export let userId: string | number = '';
    export let requiredRole: string = '';
    export let requiredCapability: string = '';
    export let adminOnly: boolean = false;
    
    // State variables
    let loading = true;
    let hasAccess = false;
    let error = '';
    let currentUser: any = null;
    
    onMount(async () => {
        try {
            // Get current user from cookie
            currentUser = parseUserFromCookieString(document.cookie);
            
            // If adminOnly is true, check if user is admin
            if (adminOnly) {
                hasAccess = isAdmin(currentUser);
                loading = false;
                return;
            }
            
            // If no userId is provided, use the current user's ID
            const targetUserId = userId || (currentUser?.id || '');
            
            // If requiredRole is provided, check if user has that role
            if (requiredRole && targetUserId) {
                const result = await checkUserRole(targetUserId, requiredRole);
                hasAccess = result.success && result.hasRole === true;
                loading = false;
                return;
            }
            
            // If no specific requirements, allow access
            if (!requiredRole && !requiredCapability && !adminOnly) {
                hasAccess = true;
            }
        } catch (err) {
            console.error('Error checking access:', err);
            error = 'Failed to check access permissions';
        } finally {
            loading = false;
        }
    });
</script>

{#if loading}
    <div class="loading">
        <slot name="loading">
            <p>Checking permissions...</p>
        </slot>
    </div>
{:else if error}
    <div class="error">
        <slot name="error" {error}>
            <p>Error: {error}</p>
        </slot>
    </div>
{:else if hasAccess}
    <slot />
{:else}
    <slot name="unauthorized">
        <p>You don't have permission to access this content.</p>
    </slot>
{/if}

<style>
    .loading, .error {
        padding: 1rem;
        border-radius: 0.25rem;
    }
    
    .loading {
        background-color: #f0f0f0;
    }
    
    .error {
        background-color: #fff0f0;
        color: #c00;
    }
</style>