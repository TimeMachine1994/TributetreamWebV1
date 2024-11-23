
<script lang="ts">
    import { writable } from 'svelte/store';
    export let data;
  
    // Store for celebration pages
    export const celebrationPages = writable([
        { id: 1, title: 'Celebration of Life - John Doe', customer: 'Jane Doe', date: '2024-03-15', status: 'Published' },
        { id: 2, title: 'Memorial Service - Sarah Smith', customer: 'Mike Smith', date: '2024-03-20', status: 'Draft' },
        { id: 3, title: 'Remembrance - Robert Johnson', customer: 'Mary Johnson', date: '2024-03-25', status: 'Published' }
    ]);
  
    // Store for new celebration page
    export const newPage = writable({
        title: '',
        customer: '',
        date: '',
        status: 'Draft'
    });
  
    // Function to add a new celebration page
    export const addPage = () => {
        celebrationPages.update(current => [
            ...current,
            { ...$newPage, id: current.length + 1 }
        ]);
        newPage.set({ title: '', customer: '', date: '', status: 'Draft' });
    };
  </script>
  
  <div class="p-6">
    <div class="mb-6">
        <h2 class="text-2xl font-bold">Celebration Pages Dashboard</h2>
    </div>
  
    <!-- Pages Table -->
    <table class="w-full bg-white shadow-md rounded-md">
        <thead class="bg-gray-200">
            <tr>
                <th class="p-4 text-left">Title</th>
                <th class="p-4 text-left">Customer</th>
                <th class="p-4 text-left">Date</th>
                <th class="p-4 text-left">Status</th>
                <th class="p-4 text-left">Actions</th>
            </tr>
        </thead>
        <tbody>
            {#each $celebrationPages as page}
                <tr class="border-b">
                    <td class="p-4">{page.title}</td>
                    <td class="p-4">{page.customer}</td>
                    <td class="p-4">{page.date}</td>
                    <td class="p-4">
                        <span class="px-2 py-1 rounded-full text-sm {page.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                            {page.status}
                        </span>
                    </td>
                    <td class="p-4">
                        <button class="text-blue-500 hover:text-blue-700 mr-2">Edit</button>
                        <button class="text-red-500 hover:text-red-700">Delete</button>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
  
    <!-- Add New Page Form -->
    <div class="mt-6 bg-white p-6 rounded-md shadow-md">
        <h3 class="text-lg font-bold mb-4">Create New Celebration Page</h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
                type="text"
                placeholder="Title"
                bind:value={$newPage.title}
                class="p-2 border rounded"
            />
            <input
                type="text"
                placeholder="Customer Name"
                bind:value={$newPage.customer}
                class="p-2 border rounded"
            />
            <input
                type="date"
                bind:value={$newPage.date}
                class="p-2 border rounded"
            />
            <button 
                on:click={addPage} 
                class="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
                Create Page
            </button>
        </div>
    </div>
  </div>
