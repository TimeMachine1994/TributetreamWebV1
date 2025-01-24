<script lang="ts">
  import BookList from '$lib/components/BookList.svelte';
  import { books, loadBooks } from '$lib/stores/books';
  import { onMount } from 'svelte';

  onMount(() => {
    loadBooks();
  });

  function handleBookSelect(event: CustomEvent<{ bookId: string }>) {
    console.log('Selected book:', event.detail.bookId);
  }
</script>

<div class="container mx-auto p-4">
  <header class="mb-8">
    <h1 class="text-3xl font-bold">Trial Commander</h1>
  </header>

  <main class="grid grid-cols-[300px_1fr] gap-4">
    <aside>
      <BookList on:select={handleBookSelect} />
    </aside>
    <section class="border rounded-lg p-4">
      <p class="text-gray-500">Select a book to view its contents</p>
    </section>
  </main>
</div>
