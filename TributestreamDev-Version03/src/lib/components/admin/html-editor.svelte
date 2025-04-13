<script lang="ts">
  /**
   * HTML Editor component for the admin interface
   * Uses TinyMCE for WYSIWYG editing
   */
  
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { browser } from '$app/environment';
  
  // Props
  export let value = '';
  export let placeholder = 'Start typing...';
  export let height = 500;
  export let disabled = false;
  export let autoFocus = true;
  export let toolbar = 'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist | link image | code';
  export let plugins = 'code table lists link image';
  export let menubar = 'file edit view insert format tools table';
  export let branding = false;
  export let inline = false;
  export let readonly = false;
  
  // Internal state
  let element: HTMLElement;
  let editor: any;
  let editorInitialized = false;
  let pendingChange = false;
  
  // Event dispatcher
  const dispatch = createEventDispatcher<{
    init: { editor: any };
    change: { value: string };
    blur: { value: string };
    focus: { value: string };
  }>();
  
  // Initialize editor on mount
  onMount(() => {
    if (!browser) return;
    
    // Check if TinyMCE is available
    if (typeof (window as any).tinymce === 'undefined') {
      console.error('TinyMCE is not loaded. Make sure to include the TinyMCE script in your HTML.');
      return;
    }
    
    // Initialize TinyMCE
    (window as any).tinymce.init({
      target: element,
      height,
      plugins,
      toolbar,
      menubar,
      branding,
      inline,
      readonly: disabled || readonly,
      placeholder,
      promotion: false,
      entity_encoding: 'raw',
      convert_urls: false,
      relative_urls: false,
      remove_script_host: false,
      paste_data_images: true,
      images_upload_handler: handleImageUpload,
      
      // Setup callback
      setup: (ed: any) => {
        editor = ed;
        
        // Set initial content
        editor.on('init', () => {
          editor.setContent(value || '');
          editorInitialized = true;
          
          if (autoFocus) {
            editor.focus();
          }
          
          dispatch('init', { editor });
        });
        
        // Handle content changes
        editor.on('change input blur', () => {
          if (!editorInitialized) return;
          
          const newContent = editor.getContent();
          if (value !== newContent) {
            pendingChange = true;
            value = newContent;
            dispatch('change', { value });
          }
        });
        
        // Handle focus
        editor.on('focus', () => {
          dispatch('focus', { value: editor.getContent() });
        });
        
        // Handle blur
        editor.on('blur', () => {
          dispatch('blur', { value: editor.getContent() });
        });
      }
    });
  });
  
  // Clean up on destroy
  onDestroy(() => {
    if (editor) {
      editor.destroy();
      editor = null;
    }
  });
  
  // Update editor content when value changes externally
  $: if (editor && editorInitialized && !pendingChange && value !== editor.getContent()) {
    editor.setContent(value || '');
  }
  
  // Reset pending change flag after value update
  $: if (pendingChange) {
    pendingChange = false;
  }
  
  // Update editor state when disabled changes
  $: if (editor && editorInitialized && editor.mode) {
    if (disabled || readonly) {
      editor.setMode('readonly');
    } else {
      editor.setMode('design');
    }
  }
  
  /**
   * Handle image upload
   * This is a placeholder implementation - in a real app, you would upload to your server
   */
  function handleImageUpload(blobInfo: any, progress: (percent: number) => void): Promise<string> {
    return new Promise((resolve, reject) => {
      // Simulate upload progress
      let percent = 0;
      const interval = setInterval(() => {
        percent += 10;
        progress(percent);
        if (percent >= 100) {
          clearInterval(interval);
        }
      }, 100);
      
      // Convert blob to base64
      const reader = new FileReader();
      reader.onload = () => {
        clearInterval(interval);
        progress(100);
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        clearInterval(interval);
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(blobInfo.blob());
    });
  }
</script>

<div class="html-editor-container" class:disabled>
  <div bind:this={element} class="html-editor"></div>
  
  {#if !browser}
    <div class="ssr-placeholder">
      <p>HTML Editor (only available in browser)</p>
    </div>
  {/if}
</div>

<style>
  .html-editor-container {
    border: 1px solid #e2e8f0;
    border-radius: 0.25rem;
    overflow: hidden;
  }
  
  .html-editor-container.disabled {
    opacity: 0.7;
    pointer-events: none;
  }
  
  .ssr-placeholder {
    padding: 1rem;
    background-color: #f8f9fa;
    color: #718096;
    text-align: center;
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  /* Override TinyMCE styles for better integration */
  :global(.tox-tinymce) {
    border: none !important;
  }
  
  :global(.tox-statusbar) {
    border-top: 1px solid #e2e8f0 !important;
  }
  
  :global(.tox-statusbar__branding) {
    display: none !important;
  }
</style>

<svelte:head>
  {#if browser}
    <script src="https://cdn.tiny.cloud/1/no-api-key/tinymce/6/tinymce.min.js" referrerpolicy="origin"></script>
  {/if}
</svelte:head>