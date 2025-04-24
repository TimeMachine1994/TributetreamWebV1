<script lang="ts">
  interface AddOn {
    id: number;
    addOnTitle: string;
    addOnDescription: string;
    addOnPrice: number;
    addOnSlug: string;
  }

  interface PageData {
    addOns: AddOn[];
  }

  let { data } = $props<{ data: PageData }>();
  console.log('📦 Loaded add-ons:', data.addOns);
</script>

<h1>Add-Ons Management</h1>

<div class="actions">
  <a href="/admin/add-ons/new" class="create-btn">Create New Add-On</a>
</div>

<div class="add-ons-list">
  {#if data.addOns?.length > 0}
    <table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Price</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each data.addOns as addOn}
          <tr>
            <td>{addOn.addOnTitle}</td>
            <td>${addOn.addOnPrice}</td>
            <td class="actions">
              <a href="/admin/add-ons/{addOn.id}">View/Edit</a>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <p>No add-ons found. Create your first one!</p>
  {/if}
</div>

<style>
  .actions {
    margin: 1rem 0;
  }
  
  .create-btn {
    display: inline-block;
    padding: 0.5rem 1rem;
    background: #4CAF50;
    color: white;
    text-decoration: none;
    border-radius: 4px;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
  }
  
  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  
  th {
    background: #f5f5f5;
  }
  
  .actions a {
    color: #2196F3;
    text-decoration: none;
  }
  
  .actions a:hover {
    text-decoration: underline;
  }
</style>