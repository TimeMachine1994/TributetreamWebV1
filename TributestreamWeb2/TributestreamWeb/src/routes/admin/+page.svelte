<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    let isAuthenticated = false;
    let userName = '';
    let isLoading = true;

    onMount(async () => {
        console.log('🏁 Admin page mounted');
        const token = localStorage.getItem('jwt_token');
        console.log('🔑 Retrieved token:', token ? 'Token exists' : 'No token found');

        if (!token) {
            console.log('⚠️ No token found, redirecting to login');
            goto('/login');
            return;
        }

        try {
            console.log('🔄 Validating token with WordPress');
            const response = await fetch('https://wp.tributestream.com/wp-json/jwt-auth/v1/token/validate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('📡 Validation response status:', response.status);
            const data = await response.json();
            console.log('📦 Validation response data:', data);

            if (response.ok) {
                console.log('✅ Token validated successfully');
                isAuthenticated = true;
             } else {
                console.log('❌ Token validation failed');
                goto('/login');
            }
        } catch (error) {
            console.error('🚨 Validation error:', error);
            goto('/login');
        } finally {
            console.log('🏁 Authentication check completed');
            isLoading = false;
        }
    });
</script>

{#if isLoading}
    <div>Loading...</div>
{:else if isAuthenticated}
    <div>
        <h1>Admin Dashboard</h1>
        <p>Welcome user!</p>
    </div>
{/if}
