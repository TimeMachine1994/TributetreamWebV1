<script lang="ts">
  import { page } from '$app/state';
  
  // Get the data from the server load function
  let { data } = $props();
  
  // Access the tribute data
  let tribute = $derived(data.tribute);
  
  // Check if the user is logged in
  let isLoggedIn = $derived(!!page.data.user);
  
  // Format date function
  function formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  // Format date and time function
  function formatDateTime(dateTimeString: string): string {
    if (!dateTimeString) return '';
    return new Date(dateTimeString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  console.log('🌟 Rendering tribute page for:', tribute.deceasedName);
</script>

<svelte:head>
  <title>In Memory of {tribute.deceasedName}</title>
  <meta name="description" content="A tribute to the life of {tribute.deceasedName}" />
</svelte:head>

<div class="tribute-container">
  {#if isLoggedIn}
    <div class="logged-in-status">
      <span>✓ You are signed in</span>
    </div>
  {/if}
  
  <header class="tribute-header">
    <h1>In Loving Memory</h1>
    <h2>{tribute.deceasedName}</h2>
    {#if tribute.birthDate && tribute.deathDate}
      <p class="lifetime-dates">
        {formatDate(tribute.birthDate)} - {formatDate(tribute.deathDate)}
      </p>
    {/if}
  </header>

  <div class="tribute-content">
    {#if tribute.obituary}
      <section class="obituary-section">
        <h3>Obituary</h3>
        <div class="obituary-text">
          {tribute.obituary}
        </div>
      </section>
    {/if}

    {#if tribute.memorialEvents && tribute.memorialEvents.length > 0}
      <section class="memorial-section">
        <h3>Memorial Services</h3>
        <div class="memorial-events">
          {#each tribute.memorialEvents as event}
            <div class="memorial-event">
              <h4>{event.eventType || 'Service'}</h4>
              <p class="event-datetime">{formatDateTime(event.eventDateTime)}</p>
              <p class="event-location">{event.location}</p>
              {#if event.description}
                <p class="event-description">{event.description}</p>
              {/if}
            </div>
          {/each}
        </div>
      </section>
    {/if}

    {#if tribute.funeralHome}
      <section class="funeral-home-section">
        <h3>Funeral Arrangements</h3>
        <div class="funeral-home-info">
          <h4>{tribute.funeralHome.data?.attributes?.name || 'Funeral Home'}</h4>
          {#if tribute.funeralHome.data?.attributes?.contactInfo}
            <p class="funeral-address">
              {tribute.funeralHome.data.attributes.contactInfo.address || ''}
              {#if tribute.funeralHome.data.attributes.contactInfo.city}
                <br />{tribute.funeralHome.data.attributes.contactInfo.city}, 
                {tribute.funeralHome.data.attributes.contactInfo.state} 
                {tribute.funeralHome.data.attributes.contactInfo.zipCode}
              {/if}
            </p>
            {#if tribute.funeralHome.data.attributes.contactInfo.phone}
              <p class="funeral-phone">
                Phone: {tribute.funeralHome.data.attributes.contactInfo.phone}
              </p>
            {/if}
            {#if tribute.funeralHome.data.attributes.contactInfo.email}
              <p class="funeral-email">
                Email: {tribute.funeralHome.data.attributes.contactInfo.email}
              </p>
            {/if}
          {/if}
        </div>
      </section>
    {/if}
  </div>
</div>

<style>
  .tribute-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem;
    font-family: 'Georgia', serif;
    line-height: 1.6;
    color: #333;
  }

  .logged-in-status {
    background-color: #f8f9fa;
    color: #28a745;
    padding: 0.5rem 1rem;
    margin-bottom: 2rem;
    border-radius: 4px;
    text-align: right;
    font-size: 0.9rem;
  }

  .tribute-header {
    text-align: center;
    margin-bottom: 3rem;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 2rem;
  }

  h1 {
    color: #3a3a3a;
    font-size: 2rem;
    font-weight: normal;
    margin-bottom: 0.5rem;
  }

  h2 {
    color: #1a1a1a;
    font-size: 2.5rem;
    margin: 0.5rem 0;
  }

  h3 {
    color: #333;
    font-size: 1.5rem;
    border-bottom: 1px solid #eaeaea;
    padding-bottom: 0.5rem;
    margin: 2rem 0 1rem;
  }

  h4 {
    color: #444;
    font-size: 1.2rem;
    margin: 1rem 0 0.5rem;
  }

  .lifetime-dates {
    font-style: italic;
    color: #555;
    margin-top: 0.5rem;
  }

  section {
    margin-bottom: 2.5rem;
  }

  .obituary-text {
    white-space: pre-line;
    line-height: 1.8;
  }

  .memorial-events {
    display: grid;
    gap: 1.5rem;
  }

  .memorial-event {
    background-color: #f9f9f9;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .event-datetime {
    font-weight: bold;
    margin-bottom: 0.5rem;
  }

  .event-location {
    margin-bottom: 0.5rem;
  }

  .funeral-home-info {
    background-color: #f9f9f9;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .funeral-address, .funeral-phone, .funeral-email {
    margin: 0.5rem 0;
  }
</style>