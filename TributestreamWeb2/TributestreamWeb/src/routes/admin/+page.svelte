<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    const API_BASE_URL = 'https://wp.tributestream.com/wp-json/tributestream/v1';
    let tributes = [];

    onMount(async () => {
        const token = sessionStorage.getItem('token');
        
        if (!token) {
            goto('/login');
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/tribute`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            if (res.ok) {
                tributes = await res.json();
            }
        } catch (err) {
            console.error('Failed to fetch tributes:', err);
        }
    });
</script>

<main>
    <h1>Admin Dashboard</h1>
    {#each tributes as tribute}
        <div class="tribute-card">
            <h2>{tribute.loved_one_name}</h2>
            <!-- Add more tribute details as needed -->
        </div>
    {/each}
</main>
