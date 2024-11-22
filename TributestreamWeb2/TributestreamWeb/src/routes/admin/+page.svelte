<script lang="ts">
	import { onMount } from 'svelte';
	export let data;

	let tributes = data.tributes || [];
	let newTribute = {
		user_id: '', // Admin user ID
		loved_one_name: '',
		slug: ''
	};

	async function deleteTribute(id: number) {
		const formData = new FormData();
		formData.append('id', id.toString());

		const response = await fetch('/admin', {
			method: 'POST',
			body: formData
		});

		if (response.ok) {
			tributes = tributes.filter((t) => t.id !== id); // Optimistic update
		} else {
			console.error('Failed to delete tribute');
		}
	}
</script>

<div>
	<h1 class="text-2xl font-bold mb-4">Admin Dashboard</h1>

	<!-- New Tribute Form -->
	<div class="mb-6">
		<h2 class="text-lg font-semibold mb-2">Create Tribute</h2>
		<form method="POST" action="?/createTribute">
			<input type="text" name="user_id" bind:value={newTribute.user_id} placeholder="User ID" required class="p-2 border rounded" />
			<input type="text" name="loved_one_name" bind:value={newTribute.loved_one_name} placeholder="Loved One's Name" required class="p-2 border rounded" />
			<input type="text" name="slug" bind:value={newTribute.slug} placeholder="Slug" required class="p-2 border rounded" />
			<button type="submit" class="bg-blue-500 text-white p-2 rounded">Add Tribute</button>
		</form>
	</div>

	<!-- Tribute List -->
	<h2 class="text-lg font-semibold mb-4">Tributes</h2>
	<table class="w-full table-auto border-collapse border border-gray-300">
		<thead>
			<tr class="bg-gray-100">
				<th class="border border-gray-300 p-2">Loved One's Name</th>
				<th class="border border-gray-300 p-2">Slug</th>
				<th class="border border-gray-300 p-2">Actions</th>
			</tr>
		</thead>
		<tbody>
			{#each tributes as tribute}
				<tr>
					<td class="border border-gray-300 p-2">{tribute.loved_one_name}</td>
					<td class="border border-gray-300 p-2">{tribute.slug}</td>
					<td class="border border-gray-300 p-2">
						<button on:click={() => deleteTribute(tribute.id)} class="bg-red-500 text-white p-1 rounded">Delete</button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
