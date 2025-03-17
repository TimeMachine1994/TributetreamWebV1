<script lang="ts">
    let button = "bg-[#D5BA7F] text-black py-2 px-4 border border-transparent rounded-lg hover:text-black hover:shadow-[0_0_10px_4px_#D5BA7F] transition-all duration-300 ease-in-out";
   
   </script>
   
   <!-- Header Section -->
   <header class="bg-black text-white">
       <div class="container mx-auto flex justify-between items-center py-4 px-4">
         <!-- Logo -->
         <a href="https://tributestream.com" class="text-xl text-white">
           <span class="tributestream">
             <i>Tributestream</i><span class="r-symbol">®</span>
           </span>
         </a>
         <!-- Navigation Menu -->
         <!-- On larger screens, show the menu items -->
         <nav class="hidden md:block">
           <ul class="flex space-x-4 items-center">
             <!-- Navigation Links -->
             <li>
               <a href="/why-tributestream" class="text-white hover:text-gray-300">
                 Why Tributestream?
               </a>
             </li>
             <li>
               <a href="/how-does-it-work" class="text-white hover:text-gray-300">
                 How does it work?
               </a>
             </li>
             <li>
               <a href="/contact-us" class="text-white hover:text-gray-300">
                 Contact Us
               </a>
             </li>
             <li>
               <a href="/schedule-now" class="text-white hover:text-gray-300">
                 Schedule Now
               </a>
             </li>
             <li>
               <a href="/family-dashboard" class={button}>
                 My Portal            
                 </a>
             </li>
             <li>
    
             </li>
           </ul>
         </nav>
    
       </div>
   </header>
   
   