<script lang="ts">
  export let data;
  const { tribute } = data;

  // Destructure tribute data for easy access
  const { loved_one_name, user_id, created_at } = tribute;

  // We can add more data fetching for related content
  let memories = [];
  let photos = [];
  let events = [];

  async function loadRelatedContent() {
      // Fetch memories, photos, and events using our API endpoints
      const [memoriesData, photosData, eventsData] = await Promise.all([
          fetch(`/wp-json/tributestream/v1/memories/${tribute.id}`).then(r => r.json()),
          fetch(`/wp-json/tributestream/v1/photos/${tribute.id}`).then(r => r.json()),
          fetch(`/wp-json/tributestream/v1/events/${tribute.id}`).then(r => r.json())
      ]);

      memories = memoriesData;
      photos = photosData;
      events = eventsData;
  }
</script>

<div class="tribute-page">
  <header class="tribute-header">
      <h1>Celebrating the Life of {loved_one_name}</h1>
      <p class="created-date">Created {new Date(created_at).toLocaleDateString()}</p>
  </header>

  <section class="tribute-photos">
      <h2>Photo Gallery</h2>
      <div class="photo-grid">
          {#each photos as photo}
              <div class="photo-item">
                  <img src={photo.photo_url} alt={photo.caption} />
                  <p>{photo.caption}</p>
              </div>
          {/each}
      </div>
  </section>

  <section class="tribute-memories">
      <h2>Shared Memories</h2>
      <div class="memories-list">
          {#each memories as memory}
              <div class="memory-card">
                  <p>{memory.memory_text}</p>
                  <span class="memory-date">{new Date(memory.created_at).toLocaleDateString()}</span>
              </div>
          {/each}
      </div>
  </section>

  <section class="tribute-events">
      <h2>Memorial Events</h2>
      <div class="events-list">
          {#each events as event}
              <div class="event-card">
                  <h3>{event.event_name}</h3>
                  <p>{event.event_description}</p>
                  <p>{event.event_location}</p>
                  <time>{new Date(event.event_date).toLocaleString()}</time>
              </div>
          {/each}
      </div>
  </section>
</div>

<style>
  .tribute-page {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
  }

  .tribute-header {
      text-align: center;
      margin-bottom: 3rem;
  }

  .photo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
  }

  .memory-card, .event-card {
      background: white;
      padding: 1.5rem;
      margin-bottom: 1rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
</style>
