<script>
    export let error = null;
</script>

<div class="login-form">
    <h1>Login</h1>
    <form method="POST">
        <input
            type="text"
            name="username"
            placeholder="Username"
            required
        />
        <input
            type="password"
            name="password"
            placeholder="Password"
            required
        />
        <button type="submit">Login</button>
    </form>
    {#if error}
        <p class="error">{error}</p>
    {/if}
</div>

<style>
    .login-form {
        max-width: 400px;
        margin: 50px auto;
        padding: 20px;
        border: 1px solid #ccc;
        border-radius: 5px;
    }

    .error {
        color: red;
        margin-top: 10px;
    }
</style>
