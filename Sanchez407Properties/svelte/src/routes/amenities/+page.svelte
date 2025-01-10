<script lang="ts">
    /**
     * This is the Amenities page for a property listing.
     * 
     * SvelteKit 5 route, using Tailwind CSS classes for styling.
     *
     * In this page, we will:
     *  - Display a title
     *  - Provide an area for text-based details (paragraphs and bullet points)
     *  - Include a space for photos or an image gallery
     *  - Incorporate property-management style text, explaining these amenities in a robust format
     *
     * Note: Replace placeholder images and text with real content where needed.
     */
  </script>
  
  <!-- 
    The main layout container uses Tailwind to center content on larger screens
    and add padding around the content. 
  -->
  <div class="flex flex-col items-center w-full p-4 md:p-8 lg:p-12">
    <!-- Page Title -->
    <h1 class="text-3xl font-bold mb-6 text-center">Amenities at Our Clairmel Court Location</h1>
  
    <!-- Paragraph Section -->
    <section class="max-w-2xl mb-8">
      <p class="mb-4 text-lg leading-7">
        Welcome to our Clairmel Court location, a property that combines modern comfort 
        and convenience to ensure a delightful stay for all guests. Whether you’re seeking 
        a quick access point to local interstates or looking for a cozy environment to 
        relax, this location offers it all. Situated in a quiet cul-de-sac, you can 
        experience a sense of seclusion while still remaining close to the vibrant heart 
        of the city. Our goal is to provide a property that meets the needs of 
        professionals, vacationers, and families alike. Below, you'll find a comprehensive 
        list of amenities, descriptions, and features that make this property truly stand out.
      </p>
  
      <p class="mb-4 text-lg leading-7">
        We understand that the right balance of comfort and practicality is crucial. 
        That’s why this property includes two separate living rooms (both equipped with TVs), 
        a fully functional dining room table for gatherings and meals, and a well-maintained 
        two-car garage for secure parking. Need additional parking? Don’t worry – we also have 
        street parking available if you have visitors dropping by. With close and easy access 
        to the 417 and 408, your daily commute or weekend adventures are just moments away. 
        Continue reading to discover all of the thoughtful touches we have in store for you 
        at Clairmel Court.
      </p>
    </section>
  
    <!-- Bullet Point Section -->
    <section class="max-w-2xl mb-8">
      <h2 class="text-2xl font-semibold mb-4">Amenities Overview</h2>
      <ul class="list-disc ml-4 text-base space-y-2">
        <li>A dedicated **dart board** area for entertainment and fun.</li>
        <li>A **dining room table** that can comfortably seat multiple guests.</li>
        <li>**Two living rooms**, each equipped with a flat-screen TV for your viewing pleasure.</li>
        <li>A **two-car garage** that provides secure, covered parking for your vehicles.</li>
        <li>Additional **street parking** in a quiet cul-de-sac, perfect for guests and visitors.</li>
        <li>Convenient access to major highways like the **417 and 408**, 
            making your commute or travel plans a breeze.</li>
      </ul>
    </section>
  
    <!-- Image / Photo Gallery Section -->
    <section class="max-w-3xl mb-8">
      <h2 class="text-2xl font-semibold mb-4">Photo Gallery</h2>
      <!-- 
        Below is a simple grid layout for images using Tailwind CSS. 
        Replace placeholders with actual image URLs.
      -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <img 
          class="w-full h-48 object-cover rounded-md" 
          src="https://via.placeholder.com/400x300?text=Dart+Board" 
          alt="Dart Board Amenity"
        />
        <img 
          class="w-full h-48 object-cover rounded-md" 
          src="https://via.placeholder.com/400x300?text=Dining+Room+Table" 
          alt="Dining Room Table"
        />
        <img 
          class="w-full h-48 object-cover rounded-md" 
          src="https://via.placeholder.com/400x300?text=Living+Rooms" 
          alt="Living Rooms with TVs"
        />
        <img 
          class="w-full h-48 object-cover rounded-md" 
          src="https://via.placeholder.com/400x300?text=Two+Car+Garage" 
          alt="Two Car Garage"
        />
        <img 
          class="w-full h-48 object-cover rounded-md" 
          src="https://via.placeholder.com/400x300?text=Street+Parking" 
          alt="Street Parking in a Cul-de-Sac"
        />
        <img 
          class="w-full h-48 object-cover rounded-md" 
          src="https://via.placeholder.com/400x300?text=417+and+408+Access" 
          alt="Near 417 and 408 Access"
        />
      </div>
    </section>
  
    <!-- Additional Details Section -->
    <section class="max-w-2xl mb-8">
      <h2 class="text-2xl font-semibold mb-4">More Information</h2>
      <p class="mb-4 text-lg leading-7">
        At Clairmel Court, our commitment to quality is evident in every detail. From the 
        moment you enter, you’ll notice the spacious layout, perfect for hosting family 
        gatherings or simple weekends of relaxation. The dart board area isn’t just a 
        fun accessory—it’s a great way to break the ice with friends or coworkers. And 
        with two separate living rooms, there’s always enough space for everyone to 
        unwind comfortably.
      </p>
      <p class="mb-4 text-lg leading-7">
        If you have any questions, feel free to reach out to us. We’re here to provide 
        all the information you need, from lease terms to local recommendations. 
        Enjoy your stay at Clairmel Court, where comfort meets convenience!
      </p>
    </section>
  
    <!-- Optional Contact / CTA Section -->
    <section class="max-w-2xl mb-8 text-center">
      <h2 class="text-2xl font-semibold mb-4">Ready to Learn More?</h2>
      <p class="mb-4 text-base leading-6">
        Contact us today to schedule a tour or get additional details on this 
        property. We look forward to helping you make Clairmel Court your next home!
      </p>
      <button 
        class="bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 transition">
        Get in Touch
      </button>
    </section>
  </div>
  