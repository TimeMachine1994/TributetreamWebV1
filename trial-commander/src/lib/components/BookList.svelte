<script lang="ts">
  import { books } from '../stores/books';
  import type { Book } from '../stores/books';

  let selectedBookId: string | null = null;

  function handleBookSelect(book: Book) {
    selectedBookId = book.id;
    // Dispatch event for parent components
    dispatch('select', { bookId: book.id });
  }

  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
</script>

<div class="book-list">
  <h2 class="text-xl font-bold mb-4">Books</h2>
  {#if $books.length === 0}
    <p class="text-gray-500">No books available</p>
  {:else}
    <ul class="space-y-2">
      {#each $books as book}
        <li>
          <button
            class="w-full text-left px-4 py-2 rounded-lg transition-colors {selectedBookId === book.id ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}"
            on:click={() => handleBookSelect(book)}
          >
            <div class="font-medium">{book.name}</div>
            <div class="text-sm {selectedBookId === book.id ? 'text-blue-100' : 'text-gray-500'}">
              {book.pages.length} pages
            </div>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .book-list {
    @apply p-4 border rounded-lg bg-white shadow-sm;
  }
</style>
