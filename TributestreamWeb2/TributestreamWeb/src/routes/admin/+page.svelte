<script lang="ts">
    import { writable } from 'svelte/store';

    // Placeholder for the initial list of live streams (fetched from backend)
    export let tributes = [];  // Provided by server load, should contain initial data

    // Writable store for managing livestreams data dynamically
    export const livestreams = writable(tributes);

    // Writable store for creating a new livestream
    export const newLivestream = writable({ 
        title: '', 
        customer: '', 
        date: '', 
        time: '', 
        status: 'Scheduled' 
    });

    // Function to add a new livestream
    export const addLivestream = async () => {
        // Check if all required fields are provided
        const { title, customer, date, time } = $newLivestream;
        if (!title || !customer || !date || !time) {
            alert("Please fill out all fields.");
            return;
        }

        try {
            // Add new livestream data to server via action or backend API call
            const formData = new FormData();
            formData.append('title', title);
            formData.append('customer', customer);
            formData.append('date', date);
            formData.append('time', time);
            formData.append('status', 'Scheduled');

            const response = await fetch('/admin?action=createLivestream', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                // Update livestream store upon successful addition
                livestreams.update(current => [
                    ...current,
                    { id: current.length + 1, ...$newLivestream }
                ]);
                
                // Reset newLivestream values after addition
                newLivestream.set({ title: '', customer: '', date: '', time: '', status: 'Scheduled' });
            } else {
                const result = await response.json();
                alert(result.error || 'Failed to add livestream');
            }
        } catch (err) {
            console.error('Error adding livestream:', err);
            alert('Server error. Please try again.');
        }
    };
</script>

<!-- Main Content -->
<main class="flex-1 p-6">
    <div class="mb-6">
        <h2 class="text-xl font-bold">Livestreams</h2>
    </div>

    <!-- Livestream Table -->
    <table class="w-full bg-white shadow-md rounded-md">
        <thead class="bg-gray-200">
            <tr>
                <th class="p-4 text-left">Title</th>
                <th class="p-4 text-left">Customer</th>
                <th class="p-4 text-left">Date</th>
                <th class="p-4 text-left">Time</th>
                <th class="p-4 text-left">Status</th>
            </tr>
        </thead>
        <tbody>
            {#each $livestreams as stream}
                <tr class="border-b">
                    <td class="p-4">{stream.title}</td>
                    <td class="p-4">{stream.customer}</td>
                    <td class="p-4">{stream.date}</td>
                    <td class="p-4">{stream.time}</td>
                    <td class="p-4">{stream.status}</td>
                </tr>
            {/each}
        </tbody>
    </table>

    <!-- Add New Livestream -->
    <div class="mt-6">
        <h3 class="text-lg font-bold mb-2">Add New Livestream</h3>
        <div class="flex gap-4">
            <input
                type="text"
                placeholder="Title"
                bind:value={$newLivestream.title}
                class="p-2 border rounded w-1/5"
            />
            <select
                bind:value={$newLivestream.customer}
                class="p-2 border rounded w-1/5"
            >
                <option value="">Select Customer</option>
                <option value="TechCorp">TechCorp</option>
                <option value="HealthCare Inc.">HealthCare Inc.</option>
                <option value="Finance Group">Finance Group</option>
            </select>
            <input
                type="date"
                bind:value={$newLivestream.date}
                class="p-2 border rounded w-1/5"
            />
            <input
                type="time"
                bind:value={$newLivestream.time}
                class="p-2 border rounded w-1/5"
            />
            <button 
                on:click={addLivestream} 
                class="bg-blue-500 text-white p-2 rounded"
            >
                Add Livestream
            </button>
        </div>
    </div>
</main>
