<script>
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';

    let tributes = $state([]);
    let totalPages = $state(1);
    let currentPage = $state(1);
    let searchQuery = $state('');
    let perPage = $state(10);
    let loading = $state(false);
    let error = $state('');
    let editingTribute = $state(null);

    $effect(() => {
        if ($page.data.jwt && (searchQuery || currentPage)) {
            fetchTributes();
        }
    });

    async function fetchTributes() {
        if (!$page.data.jwt) return;
        
        loading = true;
        error = '';
        try {
            const url = new URL('/api/tributes', window.location.origin);
            url.searchParams.set('page', currentPage.toString());
            url.searchParams.set('per_page', perPage.toString());
            if (searchQuery) {
                url.searchParams.set('search', searchQuery);
            }

            const res = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${$page.data.jwt}`
                }
            });
            if (!res.ok) throw new Error('Failed to fetch tributes');
            
            const data = await res.json();
            tributes = data.tributes || [];
            totalPages = data.total_pages || 1;
        } catch (err) {
            error = err instanceof Error ? err.message : 'An error occurred';
            tributes = [];
        } finally {
            loading = false;
        }
    }

    async function deleteTribute(id) {
        if (!$page.data.jwt || !confirm('Are you sure you want to delete this tribute?')) return;
        
        try {
            const res = await fetch(`/api/tributes/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${$page.data.jwt}`
                }
            });
            if (!res.ok) throw new Error('Failed to delete tribute');
            
            await fetchTributes();
        } catch (err) {
            error = err instanceof Error ? err.message : 'An error occurred';
        }
    }

    async function updateTribute(id) {
        if (!$page.data.jwt || !editingTribute) return;
        
        try {
            const res = await fetch(`/api/tributes/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${$page.data.jwt}`
                },
                body: JSON.stringify(editingTribute)
            });
            if (!res.ok) throw new Error('Failed to update tribute');
            
            editingTribute = null;
            await fetchTributes();
        } catch (err) {
            error = err instanceof Error ? err.message : 'An error occurred';
        }
    }

    function startEdit(tribute) {
        editingTribute = { ...tribute };
    }

    $effect.root(() => {
        if ($page.data.jwt) fetchTributes();
    });
</script>
  
<div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Tributes Management Test Page</h1>
    
    {#if error}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
        </div>
    {/if}

    {#if $page.form?.error}
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {$page.form.error}
        </div>
    {/if}
    
    {#if $page.data.authenticated}
        <div class="mb-8">
            <h2 class="text-lg font-semibold">Welcome! You are logged in.</h2>
            <form method="post" action="?/logout">
                <button type="submit" class="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
            </form>
        </div>

        <div class="mb-8">
            <h2 class="text-xl font-semibold mb-4">Create Tribute</h2>
            <form method="post" action="?/create" class="space-y-4">
                <input type="hidden" name="user_id" value="1" />
                <div>
                    <label class="block">
                        Loved One Name:
                        <input type="text" name="loved_one_name" required 
                               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    </label>
                </div>
                <div>
                    <label class="block">
                        Slug:
                        <input type="text" name="slug" required 
                               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    </label>
                </div>
                <div>
                    <label class="block">
                        Phone Number:
                        <input type="text" name="phone_number" required 
                               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    </label>
                </div>
                <button type="submit" class="bg-green-500 text-white px-4 py-2 rounded">
                    Create Tribute
                </button>
            </form>
        </div>

        <div class="mb-8">
            <h2 class="text-xl font-semibold mb-4">Existing Tributes</h2>
            
            <div class="flex gap-4 mb-4">
                <input type="text" 
                       bind:value={searchQuery}
                       placeholder="Search tributes..."
                       class="flex-1 rounded-md border-gray-300 shadow-sm" />
                       
                <select bind:value={perPage}
                        class="rounded-md border-gray-300 shadow-sm">
                    <option value="5">5 per page</option>
                    <option value="10">10 per page</option>
                    <option value="20">20 per page</option>
                </select>
                
                <button on:click={fetchTributes}
                        class="bg-blue-500 text-white px-4 py-2 rounded">
                    Refresh
                </button>
            </div>

            {#if loading}
                <div class="text-center py-4">Loading...</div>
            {:else}
                <div class="space-y-4">
                    {#each tributes as tribute (tribute.id)}
                        <div class="border rounded-lg p-4 {editingTribute?.id === tribute.id ? 'bg-blue-50' : ''}">
                            {#if editingTribute?.id === tribute.id}
                                <div class="space-y-4">
                                    <input type="text" 
                                           bind:value={editingTribute.loved_one_name}
                                           class="block w-full rounded-md border-gray-300 shadow-sm" />
                                    <input type="text" 
                                           bind:value={editingTribute.slug}
                                           class="block w-full rounded-md border-gray-300 shadow-sm" />
                                    <input type="text" 
                                           bind:value={editingTribute.phone_number}
                                           class="block w-full rounded-md border-gray-300 shadow-sm" />
                                    <div class="flex gap-2">
                                        <button on:click={() => updateTribute(tribute.id)}
                                                class="bg-green-500 text-white px-3 py-1 rounded">
                                            Save
                                        </button>
                                        <button on:click={() => editingTribute = null}
                                                class="bg-gray-500 text-white px-3 py-1 rounded">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            {:else}
                                <div>
                                    <strong>{tribute.loved_one_name}</strong>
                                    <p class="text-gray-600">Slug: {tribute.slug}</p>
                                    <p class="text-gray-600">Phone: {tribute.phone_number}</p>
                                    <div class="mt-2 flex gap-2">
                                        <button on:click={() => startEdit(tribute)}
                                                class="bg-blue-500 text-white px-3 py-1 rounded">
                                            Edit
                                        </button>
                                        <button on:click={() => deleteTribute(tribute.id)}
                                                class="bg-red-500 text-white px-3 py-1 rounded">
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            {/if}
                        </div>
                    {/each}
                </div>

                <div class="mt-4 flex justify-between items-center">
                    <button on:click={() => currentPage--}
                            disabled={currentPage === 1}
                            class="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50">
                        Previous
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button on:click={() => currentPage++}
                            disabled={currentPage === totalPages}
                            class="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50">
                        Next
                    </button>
                </div>
            {/if}
        </div>
    {:else}
        <div class="max-w-md mx-auto">
            <h2 class="text-xl font-semibold mb-4">Login</h2>
            <form method="post" action="?/login" class="space-y-4">
                <div>
                    <label class="block">
                        Username:
                        <input type="text" name="username" required 
                               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    </label>
                </div>
                <div>
                    <label class="block">
                        Password:
                        <input type="password" name="password" required 
                               class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    </label>
                </div>
                <button type="submit" class="w-full bg-blue-500 text-white px-4 py-2 rounded">
                    Login
                </button>
            </form>
        </div>
    {/if}
</div>
