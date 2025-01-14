<script>
    export let data;

    // Destructure meta values into individual variables
    const {
        nickname,
        first_name,
        last_name,
        description,
        rich_editing,
        syntax_highlighting,
        comment_shortcuts,
        admin_color,
        use_ssl,
        show_admin_bar_front,
        locale,
        wpa2_capabilities,
        wpa2_user_level,
        memorial_form_data
    } = data.userMeta;
</script>

<main class="p-6">
    <h1 class="text-2xl font-bold mb-4">User Meta Data</h1>

    <ul class="list-disc ml-6">
        <li><strong>Nickname:</strong> {nickname}</li>
        <li><strong>First Name:</strong> {first_name}</li>
        <li><strong>Last Name:</strong> {last_name}</li>
        <li><strong>Description:</strong> {description}</li>
        <li><strong>Rich Editing:</strong> {rich_editing}</li>
        <li><strong>Syntax Highlighting:</strong> {syntax_highlighting}</li>
        <li><strong>Comment Shortcuts:</strong> {comment_shortcuts}</li>
        <li><strong>Admin Color:</strong> {admin_color}</li>
        <li><strong>Use SSL:</strong> {use_ssl}</li>
        <li><strong>Show Admin Bar Front:</strong> {show_admin_bar_front}</li>
        <li><strong>Locale:</strong> {locale}</li>
        <li><strong>WPA2 Capabilities:</strong> {wpa2_capabilities}</li>
        <li><strong>WPA2 User Level:</strong> {wpa2_user_level}</li>
        <li><strong>Memorial Form Data:</strong> {memorial_form_data}</li>
    </ul>
</main>

<style>
    main {
        font-family: Arial, sans-serif;
    }
</style>
