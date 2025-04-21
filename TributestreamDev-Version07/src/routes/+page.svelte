<script lang="ts">
  import LoginForm from '$lib/components/login-form.svelte';
  import UserProfile from '$lib/components/user-profile.svelte';
  import type { UserInfo } from '$lib/types/auth.types';
  
  export let data: { user: UserInfo | null };
</script>

<svelte:head>
  <title>{data.user ? 'Your Profile' : 'Login'} | Tributestream</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md mx-auto">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-extrabold text-gray-900">
        Tributestream
      </h1>
      <p class="mt-2 text-lg text-gray-600">
        {data.user ? 'Welcome to your profile' : 'Please login to access your account'}
      </p>
    </div>

    {#if data.user}
      <UserProfile user={data.user} />
    {:else}
      <LoginForm />
    {/if}
  </div>
</div>
