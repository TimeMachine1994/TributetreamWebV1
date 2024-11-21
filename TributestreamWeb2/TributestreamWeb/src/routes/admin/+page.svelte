<script>
    export let data;
    $: tributes = data.tributes;
    $: user = data.user;
    //LEFT OFF HERE!!1
     // Format date helper
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
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