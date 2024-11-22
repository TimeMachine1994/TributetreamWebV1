<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import AdminLivestreamCard from '$lib/components/AdminLivestreamCard.svelte';
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
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {#each tributes as tribute}
            <AdminLivestreamCard
                lovedOneName={tribute.lovedOneName}
                livestreamSet={tribute.livestreamSet}
                displayName={tribute.displayName}
                createdOn={tribute.createdOn}
                modifiedOn={tribute.modifiedOn}
            />
        {/each}
    </div>
</main>