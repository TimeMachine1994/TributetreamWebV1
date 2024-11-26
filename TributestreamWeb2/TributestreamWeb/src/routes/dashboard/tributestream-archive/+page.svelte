<script lang="ts">
    import { onMount } from "svelte";
   
    let livestreams = [];
    let loading = true;
    let error = null;
  
    // Fetch livestreams on component mount
    onMount(async () => {
      try {
        const response = await fetch("/wp-json/custom/v1/tribute-pages", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          },
        });
  
        if (!response.ok) {
          throw new Error("Failed to fetch livestreams");
        }
  
        livestreams = await response.json();
      } catch (err) {
        error = err.message;
      } finally {
        loading = false;
      }
    });
  
    // Delete livestream
    async function deleteLivestream(id) {
      try {
        const response = await fetch(`/wp-json/custom/v1/tribute-pages/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          },
        });
  
        if (!response.ok) {
          throw new Error("Failed to delete livestream");
        }
  
        livestreams = livestreams.filter((livestream) => livestream.id !== id);
        alert("Livestream deleted successfully!");
      } catch (err) {
        alert(`Error: ${err.message}`);
      }
    }
  </script>
  
  <div class="bg-white shadow-md rounded p-6">
    <h1 class="text-2xl font-bold mb-4">My Livestreams</h1>
  
    {#if loading}
      <p>Loading livestreams...</p>
    {:else if error}
      <p class="text-red-500">{error}</p>
    {:else if livestreams.length === 0}
      <p>No livestreams found. <a href="/dashboard/add-livestream" class="text-blue-500">Create one now!</a></p>
    {:else}
      <table class="min-w-full table-auto border-collapse border border-gray-300">
        <thead class="bg-gray-100">
          <tr>
            <th class="border border-gray-300 px-4 py-2">Event Name</th>
            <th class="border border-gray-300 px-4 py-2">Date</th>
            <th class="border border-gray-300 px-4 py-2">Status</th>
            <th class="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each livestreams as livestream}
            <tr class="hover:bg-gray-50">
              <td class="border border-gray-300 px-4 py-2">{livestream.event_name}</td>
              <td class="border border-gray-300 px-4 py-2">{livestream.created_at}</td>
              <td class="border border-gray-300 px-4 py-2">{livestream.page_status}</td>
              <td class="border border-gray-300 px-4 py-2 space-x-2">
                <a href={`/dashboard/edit-livestream/${livestream.id}`} class="text-blue-500 hover:underline">Edit</a>
                <button
                  class="text-red-500 hover:underline"
                  on:click={() => deleteLivestream(livestream.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
  