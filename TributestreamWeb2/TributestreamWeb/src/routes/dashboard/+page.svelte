<script>
    import { onMount } from 'svelte';
    import BladeSlider from '../../lib/components/BladeSlider.svelte';
    import { WordPressApiService } from '$lib/services/WordPressApiService';
  
    let tributes = [];
    let events = [];
    let pages = [];
    let streams = [];
  
    async function fetchData() {
      try {
        const api = new WordPressApiService({ cookies: { get: () => 'jwt-token-placeholder' } }); // Replace placeholder
        tributes = await api.getAllTributes();
        events = await api.getAllEvents();
        pages = await api.getAllPages();
        streams = await api.getAllStreams(0); // Example: Use a page_id if needed
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
  
    onMount(() => {
      fetchData();
    });
  
    function handleCreateStream() {
      // Placeholder for stream creation logic
      console.log('Create stream');
    }
  </script>
  
  <div>
    <h1>Manage Livestreams</h1>
    <BladeSlider items={tributes} title="Tributes">
      <template let:item slot="item">
        <div>
          <h3>{item.loved_one_name}</h3>
          <p>Slug: {item.slug}</p>
        </div>
      </template>
    </BladeSlider>
  
    <BladeSlider items={events} title="Events">
      <template let:item slot="item">
        <div>
          <h3>{item.event_name}</h3>
          <p>{item.event_date}</p>
        </div>
      </template>
    </BladeSlider>
  
    <BladeSlider items={pages} title="Pages">
      <template let:item slot="item">
        <div>
          <h3>{item.event_name}</h3>
          <p>Status: {item.page_status}</p>
        </div>
      </template>
    </BladeSlider>
  
    <BladeSlider items={streams} title="Streams">
      <template let:item slot="item">
        <div>
          <h3>{item.stream_title}</h3>
          <p>Start: {item.start_time}</p>
        </div>
      </template>
    </BladeSlider>
  
    <button on:click={handleCreateStream}>Add New Stream</button>
  </div>
  
  <style>
    h1 {
      text-align: center;
    }
    button {
      display: block;
      margin: 2rem auto;
      padding: 0.5rem 1rem;
      background-color: #0070f3;
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  </style>
  