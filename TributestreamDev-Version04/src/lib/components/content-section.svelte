<script lang="ts">
  let { id, title, level = 2 } = $props<{
    id: string;
    title: string;
    level?: number;
  }>();

  // Dynamically determine the heading level (h2, h3, etc.)
  const HeadingTag = `h${level}`;
</script>

<section id={id} class="content-section">
  <svelte:element this={HeadingTag} class="section-title">
    {title}
  </svelte:element>
  
  <div class="section-content">
    <slot />
  </div>
</section>

<style>
  .content-section {
    margin: 2rem 0;
    scroll-margin-top: 2rem;
  }

  .section-title {
    font-weight: 600;
    margin-bottom: 1rem;
    color: #333;
    border-bottom: 1px solid #eee;
    padding-bottom: 0.5rem;
  }

  :global(.content-section h2) {
    font-size: 1.75rem;
  }

  :global(.content-section h3) {
    font-size: 1.5rem;
  }

  :global(.content-section h4) {
    font-size: 1.25rem;
  }

  .section-content {
    line-height: 1.6;
  }

  :global(.section-content p) {
    margin-bottom: 1rem;
  }

  :global(.section-content ul, .section-content ol) {
    margin-bottom: 1rem;
    padding-left: 1.5rem;
  }

  :global(.section-content li) {
    margin-bottom: 0.5rem;
  }

  :global(.section-content a) {
    color: #0066cc;
    text-decoration: none;
  }

  :global(.section-content a:hover) {
    text-decoration: underline;
  }

  :global(.section-content blockquote) {
    border-left: 4px solid #eee;
    padding-left: 1rem;
    margin-left: 0;
    color: #666;
    font-style: italic;
  }

  :global(.section-content code) {
    background-color: #f8f9fa;
    padding: 0.2rem 0.4rem;
    border-radius: 3px;
    font-family: monospace;
  }

  :global(.section-content pre) {
    background-color: #f8f9fa;
    padding: 1rem;
    border-radius: 3px;
    overflow-x: auto;
    margin-bottom: 1rem;
  }
</style>