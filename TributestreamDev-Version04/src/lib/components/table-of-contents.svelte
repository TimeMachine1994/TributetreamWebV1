<script lang="ts">
  import type { TocItem } from '$lib/types/components';

  let { items, activeSection = '' } = $props<{
    items: TocItem[];
    activeSection?: string;
  }>();

  function scrollToSection(id: string) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState(null, '', `#${id}`);
      activeSection = id;
    }
  }
</script>

<nav class="toc" aria-labelledby="toc-heading">
  <h2 id="toc-heading" class="toc-heading">Table of Contents</h2>
  <ul class="toc-list">
    {#each items as item}
      <li class="toc-item" class:active={activeSection === item.id}>
        <a 
          href={`#${item.id}`} 
          class="toc-link"
          on:click|preventDefault={() => scrollToSection(item.id)}
          aria-current={activeSection === item.id ? 'true' : undefined}
        >
          {item.title}
        </a>
        {#if item.children && item.children.length > 0}
          <ul class="toc-sublist">
            {#each item.children as child}
              <li class="toc-subitem" class:active={activeSection === child.id}>
                <a 
                  href={`#${child.id}`} 
                  class="toc-sublink"
                  on:click|preventDefault={() => scrollToSection(child.id)}
                  aria-current={activeSection === child.id ? 'true' : undefined}
                >
                  {child.title}
                </a>
              </li>
            {/each}
          </ul>
        {/if}
      </li>
    {/each}
  </ul>
</nav>

<style>
  .toc {
    position: sticky;
    top: 2rem;
    max-height: calc(100vh - 4rem);
    overflow-y: auto;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
  }

  .toc-heading {
    font-size: 1.25rem;
    margin-top: 0;
    margin-bottom: 1rem;
    font-weight: 600;
  }

  .toc-list, .toc-sublist {
    list-style: none;
    padding-left: 0;
    margin: 0;
  }

  .toc-sublist {
    padding-left: 1.5rem;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .toc-item, .toc-subitem {
    margin-bottom: 0.5rem;
  }

  .toc-link, .toc-sublink {
    display: block;
    padding: 0.25rem 0;
    color: #495057;
    text-decoration: none;
    border-left: 2px solid transparent;
    padding-left: 0.5rem;
    transition: all 0.2s ease;
  }

  .toc-link:hover, .toc-sublink:hover {
    color: #0066cc;
    border-left-color: #0066cc;
  }

  .toc-item.active > .toc-link,
  .toc-subitem.active > .toc-sublink {
    color: #0066cc;
    font-weight: 600;
    border-left-color: #0066cc;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .toc {
      position: relative;
      top: 0;
      max-height: none;
    }
  }
</style>