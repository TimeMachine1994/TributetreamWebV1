<script lang="ts">
  export let data;
  
  $: ({ tributes, status } = data);

  let editingTribute = null;
  let isEditing = false;

  function handleEdit(tribute) {
      editingTribute = { ...tribute };
      isEditing = true;
  }

  async function handleSave() {
      try {
          const response = await fetch(`http://localhost/wp-json/wp/v2/wpa2_tributes/${editingTribute.id}`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(editingTribute)
          });
          
          if (response.ok) {
              // Update local data
              tributes = tributes.map(t => 
                  t.id === editingTribute.id ? editingTribute : t
              );
              isEditing = false;
              editingTribute = null;
          }
      } catch (error) {
          console.error('Error updating tribute:', error);
      }
  }

  async function handleDelete(id) {
      if (confirm('Are you sure you want to delete this tribute?')) {
          try {
              const response = await fetch(`http://localhost/wp-json/wp/v2/wpa2_tributes/${id}`, {
                  method: 'DELETE'
              });
              
              if (response.ok) {
                  tributes = tributes.filter(t => t.id !== id);
              }
          } catch (error) {
              console.error('Error deleting tribute:', error);
          }
      }
  }
</script>

<div class="dashboard-container">
  <h1>Tribute Pages Dashboard</h1>
  
  {#if status === 'error'}
      <div class="error-message">
          Unable to load tribute pages. Please try again later.
      </div>
  {/if}

  {#if isEditing}
      <div class="edit-modal">
          <h2>Edit Tribute</h2>
          <form on:submit|preventDefault={handleSave}>
              <div class="form-group">
                  <label for="loved_one_name">Loved One's Name</label>
                  <input 
                      type="text" 
                      id="loved_one_name" 
                      bind:value={editingTribute.loved_one_name}
                  />
              </div>
              <div class="form-group">
                  <label for="phone_number">Phone Number</label>
                  <input 
                      type="text" 
                      id="phone_number" 
                      bind:value={editingTribute.phone_number}
                  />
              </div>
              <div class="form-group">
                  <label for="custom_html">Custom HTML</label>
                  <textarea 
                      id="custom_html" 
                      bind:value={editingTribute.custom_html}
                  ></textarea>
              </div>
              <div class="button-group">
                  <button type="submit" class="save-btn">Save</button>
                  <button type="button" class="cancel-btn" on:click={() => isEditing = false}>Cancel</button>
              </div>
          </form>
      </div>
  {/if}
  
  <div class="table-container">
      <table>
          <thead>
              <tr>
                  <th>ID</th>
                  <th>Loved One's Name</th>
                  <th>Phone Number</th>
                  <th>Created</th>
                  <th>Actions</th>
              </tr>
          </thead>
          <tbody>
              {#each tributes as tribute}
                  <tr>
                      <td>{tribute.id}</td>
                      <td>{tribute.loved_one_name}</td>
                      <td>{tribute.phone_number}</td>
                      <td>{new Date(tribute.created_at).toLocaleDateString()}</td>
                      <td class="actions">
                          <button class="edit-btn" on:click={() => handleEdit(tribute)}>Edit</button>
                          <button class="delete-btn" on:click={() => handleDelete(tribute.id)}>Delete</button>
                          <button class="view-btn">View</button>
                      </td>
                  </tr>
              {/each}
          </tbody>
      </table>
  </div>
</div>

<style>
  .dashboard-container {
      padding: 2rem;
      position: relative;
  }

  .edit-modal {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      z-index: 1000;
      width: 90%;
      max-width: 500px;
  }

  .form-group {
      margin-bottom: 1rem;
  }

  .form-group label {
      display: block;
      margin-bottom: 0.5rem;
  }

  .form-group input,
  .form-group textarea {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
  }

  .button-group {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
  }

  .save-btn {
      background: #4CAF50;
  }

  .cancel-btn {
      background: #9e9e9e;
  }

  .delete-btn {
      background: #f44336;
  }

  /* ... rest of your existing styles ... */
</style>
