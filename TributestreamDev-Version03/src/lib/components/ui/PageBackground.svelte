<script lang="ts">
  // Define props for customizing the gradient
  let {
    variant = 'default', // default, home, how-it-works, contact, etc.
    opacity = 0.9,
    blur = false
  } = $props();

  // Define gradient variants for different pages
  const gradients: Record<string, string> = {
    default: 'bg-gradient-to-br from-zinc-900 via-black to-zinc-900',
    home: 'bg-gradient-to-br from-zinc-900 via-black to-zinc-800',
    'how-it-works': 'bg-gradient-to-br from-indigo-950 via-black to-zinc-900',
    'contact-us': 'bg-gradient-to-br from-zinc-900 via-black to-purple-950',
    'schedule-now': 'bg-gradient-to-br from-amber-950 via-black to-zinc-900',
    'why-tributestream': 'bg-gradient-to-br from-zinc-900 via-black to-emerald-950',
    'fd-form': 'bg-gradient-to-br from-blue-950 via-black to-zinc-900',
    'my-portal': 'bg-gradient-to-br from-zinc-900 via-black to-blue-950'
  };

  // Get the gradient class based on the variant
  const gradientClass = gradients[variant] || gradients.default;
</script>

<div 
  class="fixed inset-0 w-full h-full -z-10 {gradientClass}"
  style="opacity: {opacity};"
  class:blur-sm={blur}
>
  <!-- Subtle noise texture overlay for depth -->
  <div class="absolute inset-0 bg-noise opacity-5"></div>
</div>

<style>
  /* Subtle noise background texture */
  .bg-noise {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  }
</style>