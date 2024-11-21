<script>
    export let data;
    $: tributes = data.tributes;
    $: user = data.user;
 
    import AdminLivestreamCard from '$lib/components/AdminLivestreamCard.svelte';
 
  

  
  
  
  
 
</script>

 
 
 
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
    {#each tributes as tribute}
    
        <AdminLivestreamCard
            lovedOneName={tribute.loved_one_name}
            livestreamSet={(tribute.custom_html)}
            displayName={tribute.displaName'}
            createdOn={tribute.createdOn}
            modifiedOn={tribute.modifiedOn}
        />
    {/each} 
</div>