<script lang="ts">
  import { enhance } from '$app/forms';
  
  interface AddOn {
    id: number;
    addOnTitle: string;
    addOnDescription: string;
    addOnPrice: number;
    addOnSlug: string;
  }

  interface PageData {
    addOn: AddOn;
  }

  interface FormData {
    error?: string;
    missing?: boolean;
    values?: Partial<AddOn>;
  }

  let { data, form } = $props<{ data: PageData; form?: FormData }>();
  
  function confirmDelete() {
    return confirm('Are you sure you want to delete this add-on?');
  }

  console.log('🎯 Editing add-on:', data.addOn);
</script>

<h1>Edit Add-On</h1>

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
        value={form?.values?.addOnTitle ?? data.addOn.addOnTitle}
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
      >{form?.values?.addOnDescription ?? data.addOn.addOnDescription}</textarea>
    </div>

    <div class="form-field">
      <label for="addOnPrice">Price *</label>
      <input
        type="number"
        id="addOnPrice"
        name="addOnPrice"
        step="0.01"
        value={form?.values?.addOnPrice ?? data.addOn.addOnPrice}
        required
      />
    </div>

    <div class="form-actions">
      <a href="/admin/add-ons" class="cancel-btn">Cancel</a>
      <button type="submit" formaction="?/update" class="submit-btn">Update Add-On</button>
      <button 
        type="submit" 
        formaction="?/delete" 
        class="delete-btn"
        on:click|preventDefault={confirmDelete}
      >
        Delete Add-On
      </button>
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

  .submit-btn, .delete-btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .submit-btn {
    background: #4CAF50;
    color: white;
  }

  .delete-btn {
    background: #f44336;
    color: white;
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

  .delete-btn:hover {
    background: #d32f2f;
  }

  .cancel-btn:hover {
    background: #e0e0e0;
  }
</style>