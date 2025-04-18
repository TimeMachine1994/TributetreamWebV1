<script lang="ts">
  import { onMount } from 'svelte';
  import { postsStore, posts, isLoading, postsError, pagination } from '$lib/stores/posts.store';
  
  // Pagination state
  let currentPage = 1;
  let perPage = 10;
  
  // Search state
  let searchTerm = '';
  let searchTimeout: ReturnType<typeof setTimeout>;
  
  // New post form state
  let showNewPostForm = false;
  let newPostTitle = '';
  let newPostContent = '';
  let submitting = false;
  
  // Load posts on mount
  onMount(() => {
    loadPosts();
  });
  
  // Load posts with current pagination and search
  async function loadPosts() {
    try {
      await postsStore.fetchPosts(currentPage, perPage, {
        search: searchTerm,
        orderBy: 'date',
        order: 'desc'
      });
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  }
  
  // Handle page change
  function changePage(page: number) {
    currentPage = page;
    loadPosts();
  }
  
  // Handle search input
  function handleSearch() {
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set a new timeout to avoid too many requests
    searchTimeout = setTimeout(() => {
      currentPage = 1; // Reset to first page
      loadPosts();
    }, 500);
  }
  
  // Handle create post
  async function handleCreatePost() {
    if (!newPostTitle || !newPostContent) {
      return;
    }
    
    submitting = true;
    
    try {
      await postsStore.createPost({
        title: newPostTitle,
        content: newPostContent,
        status: 'publish'
      });
      
      // Reset form
      newPostTitle = '';
      newPostContent = '';
      showNewPostForm = false;
      
      // Reload posts
      loadPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      submitting = false;
    }
  }
  
  // Handle delete post
  async function handleDeletePost(id: number) {
    if (!confirm('Are you sure you want to delete this post?')) {
      return;
    }
    
    try {
      await postsStore.deletePost(id);
      
      // Reload posts if needed
      if ($posts.length === 0 && currentPage > 1) {
        currentPage--;
        loadPosts();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  }
  
  // Format date
  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  // Strip HTML tags
  function stripHtml(html: string): string {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }
</script>

<svelte:head>
  <title>Posts | TributeStream</title>
  <meta name="description" content="Manage your WordPress posts" />
</svelte:head>

<div class="min-h-screen bg-gray-100">
  <header class="bg-white shadow">
    <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold tracking-tight text-gray-900">Posts</h1>
        <button
          type="button"
          class="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          on:click={() => showNewPostForm = !showNewPostForm}
        >
          {showNewPostForm ? 'Cancel' : 'New Post'}
        </button>
      </div>
    </div>
  </header>
  
  <main>
    <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <!-- Search -->
      <div class="mb-6">
        <div class="relative mt-2 rounded-md shadow-sm">
          <input
            type="text"
            name="search"
            id="search"
            class="block w-full rounded-md border-0 py-1.5 pl-4 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            placeholder="Search posts..."
            bind:value={searchTerm}
            on:input={handleSearch}
          />
          <div class="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
      
      <!-- New Post Form -->
      {#if showNewPostForm}
        <div class="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 class="mb-4 text-xl font-semibold text-gray-900">Create New Post</h2>
          <form on:submit|preventDefault={handleCreatePost}>
            <div class="mb-4">
              <label for="title" class="block text-sm font-medium leading-6 text-gray-900">Title</label>
              <input
                type="text"
                name="title"
                id="title"
                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                bind:value={newPostTitle}
                required
                disabled={submitting}
              />
            </div>
            <div class="mb-4">
              <label for="content" class="block text-sm font-medium leading-6 text-gray-900">Content</label>
              <textarea
                name="content"
                id="content"
                rows="5"
                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                bind:value={newPostContent}
                required
                disabled={submitting}
              ></textarea>
            </div>
            <div class="flex justify-end">
              <button
                type="submit"
                class="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submitting || !newPostTitle || !newPostContent}
              >
                {submitting ? 'Creating...' : 'Create Post'}
              </button>
            </div>
          </form>
        </div>
      {/if}
      
      <!-- Error Message -->
      {#if $postsError}
        <div class="mb-6 rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">{$postsError}</h3>
            </div>
          </div>
        </div>
      {/if}
      
      <!-- Loading Indicator -->
      {#if $isLoading}
        <div class="flex justify-center py-8">
          <svg class="h-8 w-8 animate-spin text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      {:else if $posts.length === 0}
        <div class="rounded-lg bg-white p-6 text-center shadow">
          <p class="text-gray-500">No posts found. {searchTerm ? 'Try a different search term.' : 'Create your first post!'}</p>
        </div>
      {:else}
        <!-- Posts List -->
        <div class="overflow-hidden bg-white shadow sm:rounded-md">
          <ul role="list" class="divide-y divide-gray-200">
            {#each $posts as post (post.id)}
              <li>
                <div class="block hover:bg-gray-50">
                  <div class="px-4 py-4 sm:px-6">
                    <div class="flex items-center justify-between">
                      <a href="/posts/{post.id}" class="truncate text-lg font-medium text-blue-600 hover:text-blue-800">
                        {post.title.rendered}
                      </a>
                      <div class="ml-2 flex flex-shrink-0">
                        <a
                          href="/posts/{post.id}/edit"
                          class="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800 mr-2"
                        >
                          Edit
                        </a>
                        <button
                          type="button"
                          class="inline-flex rounded-full bg-red-100 px-2 text-xs font-semibold leading-5 text-red-800"
                          on:click={() => handleDeletePost(post.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div class="mt-2 sm:flex sm:justify-between">
                      <div class="sm:flex">
                        <p class="flex items-center text-sm text-gray-500">
                          {stripHtml(post.excerpt.rendered).substring(0, 150)}...
                        </p>
                      </div>
                      <div class="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <svg class="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fill-rule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clip-rule="evenodd" />
                        </svg>
                        <p>
                          <time datetime={post.date}>{formatDate(post.date)}</time>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            {/each}
          </ul>
        </div>
        
        <!-- Pagination -->
        {#if $pagination.totalPages > 1}
          <div class="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div class="flex flex-1 justify-between sm:hidden">
              <button
                type="button"
                class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={currentPage === 1}
                on:click={() => changePage(currentPage - 1)}
              >
                Previous
              </button>
              <button
                type="button"
                class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                disabled={currentPage === $pagination.totalPages}
                on:click={() => changePage(currentPage + 1)}
              >
                Next
              </button>
            </div>
            <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  Showing <span class="font-medium">{(currentPage - 1) * perPage + 1}</span> to <span class="font-medium">{Math.min(currentPage * perPage, $pagination.totalItems)}</span> of <span class="font-medium">{$pagination.totalItems}</span> results
                </p>
              </div>
              <div>
                <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    type="button"
                    class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    disabled={currentPage === 1}
                    on:click={() => changePage(currentPage - 1)}
                  >
                    <span class="sr-only">Previous</span>
                    <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
                    </svg>
                  </button>
                  
                  {#each Array.from({ length: Math.min(5, $pagination.totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return pageNum;
                  }) as page}
                    <button
                      type="button"
                      class={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        page === currentPage
                          ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                      }`}
                      on:click={() => changePage(page)}
                    >
                      {page}
                    </button>
                  {/each}
                  
                  <button
                    type="button"
                    class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    disabled={currentPage === $pagination.totalPages}
                    on:click={() => changePage(currentPage + 1)}
                  >
                    <span class="sr-only">Next</span>
                    <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        {/if}
      {/if}
    </div>
  </main>
</div>