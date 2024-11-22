<script>
    export let data;
    $: tributes = data.tributes;
  
    import AdminLivestreamCard from '$lib/components/AdminLivestreamCard.svelte';
 
  

  
  
  
  
 
</script>

 
 
 
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
    {#each tributes as tribute}
    
        <AdminLivestreamCard
            lovedOneName={tribute.loved_one_name}
            tributeId={tribute.id}
            
            displayName={tribute.user_id}
            createdOn={tribute.created_at}
            modifiedOn={tribute.updated_at}
        />
    {/each} 
</div>