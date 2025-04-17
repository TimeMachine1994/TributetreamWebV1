<script lang="ts">
    import { parseUserFromCookieString, isAdmin } from '$lib/utils/role-helpers';
    import RoleBasedAccess from '$lib/components/role-based-access.svelte';
    
    // Get the current user from cookie
    let currentUser: any = null;
    
    // Example user IDs for demonstration
    let adminUserId = '1';
    let editorUserId = '2';
    let authorUserId = '3';
    let subscriberUserId = '4';
    
    // Initialize on client side
    if (typeof window !== 'undefined') {
        currentUser = parseUserFromCookieString(document.cookie);
    }
</script>

<svelte:head>
    <title>Role-Based Access Example</title>
</svelte:head>

<div class="container mx-auto p-6">
    <h1 class="text-3xl font-bold mb-6">Role-Based Access Control Examples</h1>
    
    {#if currentUser}
        <div class="bg-green-50 p-4 rounded-md mb-6">
            <h2 class="text-xl font-semibold mb-2">Current User</h2>
            <p><strong>User ID:</strong> {currentUser.id}</p>
            <p><strong>Name:</strong> {currentUser.name}</p>
            <p><strong>Roles:</strong> {currentUser.roles ? currentUser.roles.join(', ') : 'None'}</p>
            <p><strong>Is Admin:</strong> {isAdmin(currentUser) ? 'Yes' : 'No'}</p>
        </div>
    {:else}
        <div class="bg-yellow-50 p-4 rounded-md mb-6">
            <p>You are not logged in. Please <a href="/login" class="text-blue-600 underline">log in</a> to see the role-based content.</p>
        </div>
    {/if}
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Admin Only Content -->
        <div class="border rounded-md p-4">
            <h2 class="text-xl font-semibold mb-4">Admin Only Content</h2>
            
            <RoleBasedAccess userId={currentUser?.id || ''} adminOnly={true}>
                <div class="bg-purple-50 p-4 rounded-md">
                    <h3 class="font-semibold">Administrator Dashboard</h3>
                    <p>This content is only visible to administrators.</p>
                    <button class="bg-purple-600 text-white px-4 py-2 rounded-md mt-2">
                        Manage System Settings
                    </button>
                </div>
                
                <div slot="unauthorized" class="bg-gray-50 p-4 rounded-md">
                    <p>This content requires administrator privileges.</p>
                </div>
                
                <div slot="loading" class="bg-blue-50 p-4 rounded-md">
                    <p>Checking administrator privileges...</p>
                </div>
            </RoleBasedAccess>
        </div>
        
        <!-- Editor Role Content -->
        <div class="border rounded-md p-4">
            <h2 class="text-xl font-semibold mb-4">Editor Role Content</h2>
            
            <RoleBasedAccess userId={currentUser?.id || ''} requiredRole="editor">
                <div class="bg-blue-50 p-4 rounded-md">
                    <h3 class="font-semibold">Editor Dashboard</h3>
                    <p>This content is only visible to users with the editor role.</p>
                    <button class="bg-blue-600 text-white px-4 py-2 rounded-md mt-2">
                        Edit Content
                    </button>
                </div>
                
                <div slot="unauthorized" class="bg-gray-50 p-4 rounded-md">
                    <p>This content requires editor privileges.</p>
                </div>
            </RoleBasedAccess>
        </div>
        
        <!-- Author Role Content -->
        <div class="border rounded-md p-4">
            <h2 class="text-xl font-semibold mb-4">Author Role Content</h2>
            
            <RoleBasedAccess userId={currentUser?.id || ''} requiredRole="author">
                <div class="bg-green-50 p-4 rounded-md">
                    <h3 class="font-semibold">Author Dashboard</h3>
                    <p>This content is only visible to users with the author role.</p>
                    <button class="bg-green-600 text-white px-4 py-2 rounded-md mt-2">
                        Create New Post
                    </button>
                </div>
                
                <div slot="unauthorized" class="bg-gray-50 p-4 rounded-md">
                    <p>This content requires author privileges.</p>
                </div>
            </RoleBasedAccess>
        </div>
        
        <!-- Public Content -->
        <div class="border rounded-md p-4">
            <h2 class="text-xl font-semibold mb-4">Public Content</h2>
            
            <div class="bg-gray-50 p-4 rounded-md">
                <h3 class="font-semibold">Public Information</h3>
                <p>This content is visible to all users, regardless of role.</p>
                <button class="bg-gray-600 text-white px-4 py-2 rounded-md mt-2">
                    View Public Content
                </button>
            </div>
        </div>
    </div>
    
    <div class="mt-8">
        <h2 class="text-xl font-semibold mb-4">Role Assignment (Admin Only)</h2>
        
        <RoleBasedAccess userId={currentUser?.id || ''} adminOnly={true}>
            <div class="bg-white p-4 rounded-md border">
                <h3 class="font-semibold mb-2">Assign Roles to Users</h3>
                <p class="mb-4">As an administrator, you can assign roles to other users.</p>
                
                <form class="space-y-4">
                    <div>
                        <label class="block mb-1">User ID</label>
                        <input type="text" class="w-full p-2 border rounded-md" placeholder="Enter user ID">
                    </div>
                    
                    <div>
                        <label class="block mb-1">Role</label>
                        <select class="w-full p-2 border rounded-md">
                            <option value="administrator">Administrator</option>
                            <option value="editor">Editor</option>
                            <option value="author">Author</option>
                            <option value="subscriber">Subscriber</option>
                        </select>
                    </div>
                    
                    <button type="button" class="bg-blue-600 text-white px-4 py-2 rounded-md">
                        Assign Role
                    </button>
                </form>
            </div>
            
            <div slot="unauthorized" class="bg-gray-50 p-4 rounded-md border">
                <p>Only administrators can assign roles to users.</p>
            </div>
        </RoleBasedAccess>
    </div>
</div>