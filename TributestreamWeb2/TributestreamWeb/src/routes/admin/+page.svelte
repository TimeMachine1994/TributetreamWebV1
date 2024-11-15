<script lang="ts">
     import { writable } from 'svelte/store';
    export let data;

    // Single definition of livestreams store with initial data
    export const livestreams = writable([
        { id: 1, title: 'Product Launch', customer: 'TechCorp', date: '2024-03-15', time: '10:00 AM', status: 'Scheduled' },
        { id: 2, title: 'Q&A Session', customer: 'HealthCare Inc.', date: '2024-03-20', time: '02:00 PM', status: 'Live' },
        { id: 3, title: 'Annual Meeting', customer: 'Finance Group', date: '2024-03-25', time: '09:00 AM', status: 'Ended' }
    ]);

    // Single definition of newLivestream store
    export const newLivestream = writable({ 
        title: '', 
        customer: '', 
        date: '', 
        time: '', 
        status: 'Scheduled' 
    });

    // Function to add a new livestream
    export const addLivestream = () => {
        livestreams.update(current => [
            ...current,
            { ...$newLivestream, id: current.length + 1 }
        ]);
        newLivestream.set({ title: '', customer: '', date: '', time: '', status: 'Scheduled' });
    };
 
</script>
<div class="-age-content"></div>
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
        <button on:click={addLivestream} class="bg-blue-500 text-white p-2 rounded">Add Livestream</button>
      </div>
    </div>
  </main>
 