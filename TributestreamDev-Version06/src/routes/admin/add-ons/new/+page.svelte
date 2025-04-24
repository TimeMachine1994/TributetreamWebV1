<script lang="ts">
  import { enhance } from '$app/forms';
  
  let { form } = $props<{
    form?: {
      error?: string;
      missing?: boolean;
      values?: {
        addOnTitle?: string;
        addOnDescription?: string;
        addOnPrice?: number;
      }
    }
  }>();

  console.log('🎯 Form state:', form);
</script>

<h1>Create New Add-On</h1>

<div class="form-container">
  <form method="POST" use:enhance>
    {#if form?.error}
      <div class="error">
        {form.error}
      </div>
    {/if}

    <div class="form-field">
      <label for="addOnTitle">Title *</label>
      <input
        type="text"
        id="addOnTitle"
        name="addOnTitle"
        value={form?.values?.addOnTitle ?? ''}
        required
      />
      {#if form?.missing}
        <span class="error">Title is required</span>
      {/if}
    </div>

    <div class="form-field">
      <label for="addOnDescription">Description</label>
      <textarea
        id="addOnDescription"
        name="addOnDescription"
        rows="4"
        value={form?.values?.addOnDescription ?? ''}
      ></textarea>
    </div>

    <div class="form-field">
      <label for="addOnPrice">Price *</label>
      <input
        type="number"
        id="addOnPrice"
        name="addOnPrice"
        step="0.01"
        value={form?.values?.addOnPrice ?? ''}
        required
      />
    </div>

    <div class="form-actions">
      <a href="/admin/add-ons" class="cancel-btn">Cancel</a>
      <button type="submit" class="submit-btn">Create Add-On</button>
    </div>
  </form>
</div>

<style>
  .form-container {
    max-width: 600px;
    margin: 2rem auto;
  }

  .form-field {
    margin-bottom: 1.5rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
  }

  input, textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  .error {
    color: #f44336;
    margin-top: 0.5rem;
    font-size: 0.875rem;
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
  }

  .submit-btn {
    padding: 0.5rem 1rem;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .cancel-btn {
    padding: 0.5rem 1rem;
    background: #f5f5f5;
    color: #333;
    text-decoration: none;
    border-radius: 4px;
  }

  .submit-btn:hover {
    background: #45a049;
  }

  .cancel-btn:hover {
    background: #e0e0e0;
  }
</style>