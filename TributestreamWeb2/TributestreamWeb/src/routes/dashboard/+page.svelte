<!-- *****************************************************************************************
     +page.svelte

     This file is the main Dashboard page in Svelte 5. It demonstrates:
       1. Using Runes ($state, $effect) for reactivity.
       2. Handling props via $props().
       3. Managing editing and saving logic for tribute objects.
     ***************************************************************************************** -->

     <script lang="ts">
        /******************************************************************************
         * Imports and Declarations
         *****************************************************************************/
        import type { Tribute } from './+page.server';
    
        /**
         * Environment variable pointing to our WordPress API base URL
         */
        const BASE_WORDPRESS_API = process.env.BASE_WORDPRESS_API;
    
        /**
         * Destructuring data from server load function using Svelte 5's $props() function.
         * We need to invoke $props() with parentheses to comply with Svelte 5's rune usage.
         */
        const { data } = $props();
    
        /**
         * Svelte 5 Runes:
         *  - $state: declare a reactive state variable
         *  - $effect: execute side effects that depend on reactive variables
         */
    
        // tributes: stores the array of Tribute items
        let tributes = $state<Tribute[]>([]);
    
        // status: indicates loading state or error/success status
        let status = $state<string>('loading');
    
        // The $effect rune: run this whenever `data` changes.
        // This ensures that "status" and "tributes" are updated
        // after the server load function completes.
        $: $effect(() => {
            status = data.status;
            // data.tributes is a JSON string from the server; parse it into an array
            tributes = JSON.parse(data.tributes);
        });
    
        // editingTribute: keeps track of the currently edited tribute object
        let editingTribute = $state<Tribute | null>(null);
    
        // isEditing: boolean flag indicating if we are in "edit mode"
        let isEditing = $state(false);
    
        /**
         * handleEdit - prepares the tribute object for editing
         * @param tribute - the tribute object that should be edited
         */
        function handleEdit(tribute: Tribute) {
            editingTribute = { ...tribute };
            isEditing = true;
        }
    
        /**
         * handleSave - sends the updated tribute object to our custom WordPress endpoint
         *              and updates the local tributes array upon success.
         */
        async function handleSave() {
            if (!editingTribute) return;
    
            try {
                const response = await fetch(`${BASE_WORDPRESS_API}/custom/v1/tributestream`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(editingTribute)
                });
    
                if (response.ok) {
                    // Update the tributes array with the newly edited tribute
                    tributes = tributes.map((t) =>
                        t.id === editingTribute?.id ? editingTribute : t
                    );
                    // Reset the editing states
                    isEditing = false;
                    editingTribute = null;
                }
            } catch (error) {
                console.error('Error updating tribute:', error);
            }
        }
    </script>
    
    <!-- 
        We use Svelte markup to conditionally show loading, no tributes, or 
        a list of tribute cards with edit buttons.
    -->
    {#if status === 'loading'}
        <div>Loading tributes...</div>
    {:else if tributes.length === 0}
        <div>No tributes found.</div>
    {:else}
        <div class="tributes-container">
            {#each tributes as tribute (tribute.id)}
                <div class="tribute-card">
                    {#if isEditing && editingTribute?.id === tribute.id}
                        <!-- Edit Form -->
                        <div class="editing-form">
                            <!-- 
                                For demonstration, we assume the WP data has "title" and "content".
                                Adjust these fields as needed for your actual data structure.
                            -->
                            <input 
                                type="text" 
                                bind:value={editingTribute.title} 
                                placeholder="Title" 
                            />
                            <textarea 
                                bind:value={editingTribute.content}
                                placeholder="Content"
                            ></textarea>
    
                            <button onclick={handleSave}>Save</button>
                            <button 
                                onclick={() => {
                                    isEditing = false; 
                                    editingTribute = null;
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    {:else}
                        <!-- Display Tribute -->
                        <h3>{tribute.title}</h3>
                        <p>{tribute.content}</p>
                        <button onclick={() => handleEdit(tribute)}>Edit</button>
                    {/if}
                </div>
            {/each}
        </div>
    {/if}
    
    <style>
        /******************************************************************************
         * Styles for the tribute dashboard
         *****************************************************************************/
        .tributes-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1rem;
            padding: 1rem;
        }
    
        .tribute-card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 1rem;
            background-color: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
    
        .editing-form {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
    
        input,
        textarea {
            padding: 0.5rem;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
    
        textarea {
            min-height: 100px;
            resize: vertical;
        }
    
        button {
            padding: 0.5rem 1rem;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
    
        button:hover {
            background-color: #45a049;
        }
    </style>
    