<script lang="ts">
	import '../app.css';
	import headerLogo from '$lib/assets/headerLogo.png';
	let { children } = $props();
</script>
<header class="bg-white shadow-md">
	<nav class="container mx-auto px-4 py-2 flex items-center justify-between">
		<div class="flex items-center">
			<a href="/">
			  <img src={headerLogo} alt="Sanchez407 Properties Logo" class="h-12 w-auto">
			</a>
		  </div>
		  
	  <div class="flex gap-4">
		<a href="/amenities" class="px-4 py-2 text-gray-700 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors">
			Amenities
		  </a>
		<button class="px-4 py-2 text-gray-700 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors">
		  Floor Plan
		</button>
		<button class="px-4 py-2 text-gray-700 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors">
		  Contact Us
		</button>
		<button class="px-4 py-2 text-gray-700 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors">
		  Apply Now
		</button>
	  </div>
	</nav>
  </header>
{@render children()}
