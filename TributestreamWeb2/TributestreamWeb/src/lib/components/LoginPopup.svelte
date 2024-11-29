<script>
    export let action = "/login"; // Default form action (customizable)
  </script>
  
  <div class="group relative inline-block">
    <button class="hover:text-blue-400">SIGN IN</button>
  
    <!-- Popup container -->
    <div
      class="hidden group-hover:block bg-white border border-gray-300 shadow-lg rounded-lg mt-2 p-4 w-64 z-10"
    >
      <!-- Login Form -->
      <form action={action} method="POST" class="space-y-4">
        <div>
          <label
            for="username"
            class="block text-sm font-medium text-gray-700"
            >Username</label
          >
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Enter your username"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-400 focus:border-blue-400"
          />
        </div>
        <div>
          <label
            for="password"
            class="block text-sm font-medium text-gray-700"
            >Password</label
          >
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-400 focus:border-blue-400"
          />
        </div>
        <button
          type="submit"
          class="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
        >
          Sign In
        </button>
      </form>
      <a
        href="/forgot-password"
        class="block text-center text-sm text-blue-500 hover:underline mt-2"
      >
        Forgot your password?
      </a>
    </div>
  </div>
  