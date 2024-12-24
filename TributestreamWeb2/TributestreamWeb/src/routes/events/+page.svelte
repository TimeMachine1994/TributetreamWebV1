<script lang="ts">
    let { events } = $props();
</script>

<main>
    <h1>Manage Events</h1>
    <ul>
        {#each events as event}
            <li>{event.event_name}</li>
        {/each}
    </ul>
</main>
