<script>
    /** @type {{ data: import('./$types').PageData }} */
    let { data } = $props();
</script>

<h1>User Details</h1>
<p>User ID: {data.userId}</p>
<p>User Data: {JSON.stringify(data.userData)}</p>
<p>User Metadata: {JSON.stringify(data.userMeta)}</p>
