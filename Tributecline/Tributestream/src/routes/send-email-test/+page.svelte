<script lang="ts">
  let to = '';
  let subject = '';
  let text = '';
  let html = '';
  let message = '';
  let isLoading = false;
  let isError = false;

  async function handleSubmit() {
    isLoading = true;
    isError = false;
    message = '';

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject,
          text,
          html: html || text // Use text as HTML if no HTML provided
        })
      });

      const result = await response.json();
      
      if (result.success) {
        message = 'Email sent successfully!';
        // Clear form
        to = '';
        subject = '';
        text = '';
        html = '';
      } else {
        throw new Error(result.error || 'Failed to send email');
      }
    } catch (error) {
      isError = true;
      message = error instanceof Error ? error.message : 'Failed to send email';
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="max-w-2xl mx-auto p-6">
  <h1 class="text-2xl font-bold mb-6">Send Test Email</h1>

  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <div>
      <label for="to" class="block text-sm font-medium mb-1">To:</label>
      <input
        type="email"
        id="to"
        bind:value={to}
        required
        class="w-full p-2 border rounded"
        placeholder="recipient@example.com"
      />
    </div>

    <div>
      <label for="subject" class="block text-sm font-medium mb-1">Subject:</label>
      <input
        type="text"
        id="subject"
        bind:value={subject}
        required
        class="w-full p-2 border rounded"
        placeholder="Email subject"
      />
    </div>

    <div>
      <label for="text" class="block text-sm font-medium mb-1">Text Content:</label>
      <textarea
        id="text"
        bind:value={text}
        required
        class="w-full p-2 border rounded h-32"
        placeholder="Plain text content"
      ></textarea>
    </div>

    <div>
      <label for="html" class="block text-sm font-medium mb-1">HTML Content (optional):</label>
      <textarea
        id="html"
        bind:value={html}
        class="w-full p-2 border rounded h-32"
        placeholder="HTML content (optional)"
      ></textarea>
    </div>

    <button
      type="submit"
      disabled={isLoading}
      class="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
    >
      {isLoading ? 'Sending...' : 'Send Email'}
    </button>

    {#if message}
      <div class={`p-4 rounded ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
        {message}
      </div>
    {/if}
  </form>
</div>