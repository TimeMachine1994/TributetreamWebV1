<script>
	let name = '';
     import { onMount } from 'svelte';

  
 
</script>
  
  <section class="relative bg-gray-900 text-white">
	<!-- Background Video -->
	<video autoplay muted loop playsinline class="absolute inset-0 w-full h-full object-cover z-0">
	  <source src="../../videos/video.mp4" type="video/mp4" />
	  Your browser does not support the video tag.
	</video>
  
	<!-- Overlay -->
	<div class="absolute inset-0 bg-black opacity-50 z-10"></div>
  
	<!-- Hero Content -->
 

	<div class="relative z-20 flex flex-col items-center justify-center h-screen min-w-screen">
	  <h1 class="text-4xl md:text-6xl font-bold text-center mb-4">
		Tributestream
	</h1>
	  <h2> Celebrating loved ones through time and space.</h2> <br>
	  <p class="text-center mb-8 text-lg md:text-xl">
		Please enter your loved one's name below to find or create a livestream.
	  </p>
	  <form class="w-full max-w-md">
		<input 
		  type="text" 
		  placeholder="Enter name" 
		  class="w-full px-4 py-2 text-gray-900 rounded-md mb-4" 
		  bind:value={name} 
		/>
		<div class="flex space-x-4 justify-center">
		  <button type="button" class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md">
			Create Link
		  </button>
		  <button type="button" class="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-md">
			Find Livestream
		  </button>
		</div>
	  </form>
	</div>
  </section>
  
  <!-- Below Hero Section -->
  
 
<section class="bg-black text-white py-16">
  <div class="text-center mb-16">
    <h2 class="text-4xl font-bold mb-4">Our Process</h2>
    <p class="text-xl">A Timeline of How We Honor Your Loved Ones</p>
  </div>
  
  <div class="grid grid-cols-1 md:grid-cols-3 gap-20 mx-20">
    <div class="text-center">
       <h3 class="text-xl font-semibold mb-4">Together We Create a Memorial Page</h3>
      <p class="text-lg">Connecting your family has never been easier. With the memorial link, you'll be able to share access with loved ones accross the world.</p>
    </div>

    <div class="text-center">
       <h3 class="text-xl font-semibold mb-4">Tributestream Captures the Moment so You Can Focus on the Memories</h3>
      <p class="text-lg">We will send one of our professional videographers to capture the service for you. They’ll be dressed respectfully and have all the equipment needed to stream the service live online. </p>
    </div>

    <div class="text-center">
       <h3 class="text-xl font-semibold mb-4">Complimentary Hosting and Download</h3>
      <p class="text-lg">After the service, the sharable link will stay active for at least one year. Anyone may revisit the memoral or view it if they did not watch it live.</p>
    </div>
  </div>
</section>

 
 
 <!-- Second half of content-->

 
 <section class="bg-black text-white py-16">
	<div class="text-center mb-8">
	  <h2 class="text-3xl font-semibold tracking-wide">Trusted by Hundreds of Families</h2>
	</div>
  
	<div class="flex justify-center space-x-12 text-center">
	  <div class="flex flex-col items-center">
		<p class="text-5xl font-bold">34k+</p>
		<p class="text-lg mt-2">Total Views</p>
	  </div>
  
	  <div class="border-l-2 border-gray-600 h-12 my-auto"></div>
  
	  <div class="flex flex-col items-center">
		<p class="text-5xl font-bold">108</p>
		<p class="text-lg mt-2">Countries</p>
	  </div>
  
	  <div class="border-l-2 border-gray-600 h-12 my-auto"></div>
  
	  <div class="flex flex-col items-center">
		<p class="text-5xl font-bold">743</p>
		<p class="text-lg mt-2">Total Watch Time<br/>(In Days)</p>
	  </div>
  
	  <div class="border-l-2 border-gray-600 h-12 my-auto"></div>
  
	  <div class="flex flex-col items-center">
		<p class="text-5xl font-bold">27k+</p>
		<p class="text-lg mt-2">Viewed on a Phone</p>
	  </div>
	</div>
  </section>
  
  
  
  