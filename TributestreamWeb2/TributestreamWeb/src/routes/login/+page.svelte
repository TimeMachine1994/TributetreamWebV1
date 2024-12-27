<script lang="ts"> 
import { redirect } from '@sveltejs/kit';
import type { PageData, ActionData } from './$types';
 
let { data, form }: { data: PageData, form: ActionData } = $props();


</script>
{#if form?.success}

	<!-- this message is ephemeral; it exists because the page was rendered in
	       response to a form submission. it will vanish if the user reloads -->
	<p>Successfully logged in! Welcome back, {data.user.nicename}</p>
{/if}
<form method="POST" action="?/login">
<label for="username">Username:</label>
<input type="text" id="username" name="username" required>
<label for="password">Password:</label>
<input type="password" id="password" name="password" required>
<button type="submit">Login</button>
</form>