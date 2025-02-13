<script lang="ts">
  const currentYear = new Date().getFullYear();
</script>

<footer class="bg-black text-white pt-16 pb-8">
  <div class="container mx-auto px-4">
    <!-- Main footer content -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
      <!-- Brand section -->
      <div class="space-y-4">
        <a href="/" class="block">
          <span class="font-great-vibes text-3xl">
            <i>Tributestream</i><span class="text-xs align-top relative -top-2 left-1">®</span>
          </span>
        </a>
        <p class="text-gray-400 font-fanwood">
          Preserving memories and celebrating lives through timeless video tributes.
        </p>
      </div>

      <!-- Quick Links -->
      <div>
        <h3 class="text-[#D5BA7F] font-semibold text-lg mb-4">Quick Links</h3>
        <ul class="space-y-2">
          <li>
            <a 
              href="/why-tributestream"
              class="text-gray-400 hover:text-[#D5BA7F] transition-colors duration-300"
            >
              Why Tributestream?
            </a>
          </li>
          <li>
            <a 
              href="/how-it-works"
              class="text-gray-400 hover:text-[#D5BA7F] transition-colors duration-300"
            >
              How does it work?
            </a>
          </li>
          <li>
            <a 
              href="/schedule"
              class="text-gray-400 hover:text-[#D5BA7F] transition-colors duration-300"
            >
              Schedule Now
            </a>
          </li>
          <li>
            <a 
              href="/contact"
              class="text-gray-400 hover:text-[#D5BA7F] transition-colors duration-300"
            >
              Contact Us
            </a>
          </li>
        </ul>
      </div>

      <!-- Contact Information -->
      <div>
        <h3 class="text-[#D5BA7F] font-semibold text-lg mb-4">Contact Us</h3>
        <ul class="space-y-2 text-gray-400">
          <li class="flex items-center gap-2">
            <i class="fas fa-envelope text-[#D5BA7F]"></i>
            <a 
              href="mailto:info@tributestream.com"
              class="hover:text-[#D5BA7F] transition-colors duration-300"
            >
              info@tributestream.com
            </a>
          </li>
          <li class="flex items-center gap-2">
            <i class="fas fa-phone text-[#D5BA7F]"></i>
            <a 
              href="tel:+1234567890"
              class="hover:text-[#D5BA7F] transition-colors duration-300"
            >
              (123) 456-7890
            </a>
          </li>
        </ul>
      </div>

      <!-- Social Media -->
      <div>
        <h3 class="text-[#D5BA7F] font-semibold text-lg mb-4">Follow Us</h3>
        <div class="flex gap-4">
          <a 
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            class="text-gray-400 hover:text-[#D5BA7F] transition-colors duration-300"
            aria-label="Facebook"
          >
            <i class="fab fa-facebook-f text-2xl"></i>
          </a>
          <a 
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            class="text-gray-400 hover:text-[#D5BA7F] transition-colors duration-300"
            aria-label="Instagram"
          >
            <i class="fab fa-instagram text-2xl"></i>
          </a>
          <a 
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            class="text-gray-400 hover:text-[#D5BA7F] transition-colors duration-300"
            aria-label="LinkedIn"
          >
            <i class="fab fa-linkedin-in text-2xl"></i>
          </a>
        </div>
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="border-t border-gray-800 pt-8">
      <div class="flex flex-col md:flex-row justify-between items-center gap-4">
        <!-- Copyright -->
        <p class="text-gray-400 text-sm text-center md:text-left">
          © {currentYear} Tributestream. All rights reserved.
        </p>
        
        <!-- Legal links -->
        <div class="flex flex-wrap justify-center md:justify-end gap-4 text-sm">
          <a 
            href="/privacy"
            class="text-gray-400 hover:text-[#D5BA7F] transition-colors duration-300"
          >
            Privacy Policy
          </a>
          <a 
            href="/terms"
            class="text-gray-400 hover:text-[#D5BA7F] transition-colors duration-300"
          >
            Terms of Service
          </a>
        </div>
      </div>
    </div>
  </div>
</footer>

<style>
  /* Import Google Fonts */
  @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Fanwood+Text&display=swap');
</style>
