<script lang="ts">
    // Form state with Svelte 5 runes
    let username = $state('');
    let email = $state('');
    let password = $state('');
    let confirmPassword = $state('');
    let loading = $state(false);
    let successMessage = $state('');
    
    // Validation state
    let errors = $state({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        form: ''
    });
    
    // Computed validation states
    let isUsernameValid = $derived(!errors.username && username.trim().length > 0);
    let isEmailValid = $derived(!errors.email && email.trim().length > 0);
    let isPasswordValid = $derived(!errors.password && password.length > 0);
    let isConfirmPasswordValid = $derived(!errors.confirmPassword && confirmPassword.length > 0);
    let isFormValid = $derived(
        isUsernameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid
    );
    
    // Validate email format
    function validateEmail() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) {
            errors.email = 'Email is required';
        } else if (!emailRegex.test(email)) {
            errors.email = 'Please enter a valid email address';
        } else {
            errors.email = '';
        }
    }
    
    // Validate username
    function validateUsername() {
        if (!username.trim()) {
            errors.username = 'Username is required';
        } else if (username.length < 3) {
            errors.username = 'Username must be at least 3 characters';
        } else {
            errors.username = '';
        }
    }
    
    // Validate password
    function validatePassword() {
        if (!password) {
            errors.password = 'Password is required';
        } else if (password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        } else {
            errors.password = '';
        }
        
        // Also validate confirm password when password changes
        validateConfirmPassword();
    }
    
    // Validate confirm password
    function validateConfirmPassword() {
        if (!confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        } else {
            errors.confirmPassword = '';
        }
    }
    
    // Handle form submission
    async function handleSubmit(event: SubmitEvent) {
        event.preventDefault();
        
        // Run all validations
        validateUsername();
        validateEmail();
        validatePassword();
        validateConfirmPassword();
        
        // Check if form is valid
        if (
            !errors.username &&
            !errors.email &&
            !errors.password &&
            !errors.confirmPassword
        ) {
            loading = true;
            errors.form = '';
            
            try {
                console.log('📝 Registration form submitted:', {
                    username,
                    email,
                    password: password ? '********' : undefined // Log masked password for security
                });
                
                // Improved error handling and debugging
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username,
                        email,
                        password,
                        role: 'Family Contact' // Default role
                    })
                });
                
                // Log response status
                console.log(`🔄 Registration API response status: ${response.status}`);
                
                // Parse response
                const data = await response.json();
                console.log('📊 Registration API response:', data);
                
                if (data.success) {
                    // Registration successful
                    successMessage = 'Registration successful! Redirecting to login page...';
                    errors.form = '';
                    
                    // Clear form
                    username = '';
                    email = '';
                    password = '';
                    confirmPassword = '';
                    
                    // Redirect with a slight delay to show success message
                    setTimeout(() => {
                        window.location.href = '/login?registered=true';
                    }, 2000);
                } else {
                    // Registration failed
                    errors.form = data.message || 'Registration failed. Please try again.';
                    successMessage = '';
                }
            } catch (error) {
                console.error('❌ Registration error:', error);
                errors.form = 'An unexpected error occurred. Please try again later.';
            } finally {
                loading = false;
            }
        } else {
            errors.form = 'Please fix the errors in the form';
        }
    }
</script>

<!-- Hero Section with Call to Action -->
<section class="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-20">
    <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto text-center">
            <h1 class="text-4xl md:text-5xl font-bold mb-6">Create Beautiful Memorial Pages</h1>
            <p class="text-xl mb-8">Honor your loved ones with a dedicated online memorial space where family and friends can share memories, photos, and support.</p>
            
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                    href="/funeral-director-portal/fd-tribute-creator" 
                    class="btn bg-white text-blue-800 hover:bg-blue-100 py-3 px-8 rounded-lg font-medium text-lg shadow-lg hover:shadow-xl transition-all"
                >
                    Create a Memorial Page
                </a>
                <a 
                    href="#learn-more" 
                    class="btn bg-transparent border-2 border-white text-white hover:bg-white/10 py-3 px-8 rounded-lg font-medium text-lg"
                >
                    Learn More
                </a>
            </div>
        </div>
    </div>
</section>

<!-- Features Section -->
<section id="learn-more" class="py-16 bg-gray-50">
    <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">How It Works</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Step 1 -->
            <div class="bg-white p-6 rounded-lg shadow-md text-center">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-800 rounded-full text-2xl font-bold mb-4">1</div>
                <h3 class="text-xl font-semibold mb-3">Create</h3>
                <p class="text-gray-600">Fill out a simple form with information about your loved one and customize their memorial page.</p>
            </div>
            
            <!-- Step 2 -->
            <div class="bg-white p-6 rounded-lg shadow-md text-center">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-800 rounded-full text-2xl font-bold mb-4">2</div>
                <h3 class="text-xl font-semibold mb-3">Share</h3>
                <p class="text-gray-600">Invite family and friends to visit the memorial page and contribute their memories and photos.</p>
            </div>
            
            <!-- Step 3 -->
            <div class="bg-white p-6 rounded-lg shadow-md text-center">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-800 rounded-full text-2xl font-bold mb-4">3</div>
                <h3 class="text-xl font-semibold mb-3">Remember</h3>
                <p class="text-gray-600">Keep your loved one's memory alive with a permanent online tribute that can be visited anytime.</p>
            </div>
        </div>
        
        <div class="text-center mt-12">
            <a 
                href="/funeral-director-portal/fd-tribute-creator" 
                class="btn bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg font-medium inline-block"
            >
                Create Your Memorial Page
            </a>
        </div>
    </div>
</section>

<!-- Registration Form Section -->
<div class="py-16 bg-white">
    <div class="container mx-auto px-4">
        <div class="max-w-md mx-auto p-8 bg-white rounded-lg shadow-md border border-gray-200">
            <h2 class="text-2xl font-bold text-center mb-6">Create an Account</h2>
            
            <form 
                on:submit={handleSubmit}
                class="space-y-4"
            >
                <!-- Username field -->
                <div>
                    <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
                    <input 
                        type="text"
                        id="username" 
                        name="username" 
                        bind:value={username}
                        on:blur={validateUsername}
                        required 
                        class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                    {#if errors.username}
                        <p class="mt-1 text-sm text-red-500">{errors.username}</p>
                    {/if}
                </div>
                
                <!-- Email field -->
                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                    <input 
                        type="email"
                        id="email" 
                        name="email" 
                        bind:value={email}
                        on:blur={validateEmail}
                        required 
                        class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                    {#if errors.email}
                        <p class="mt-1 text-sm text-red-500">{errors.email}</p>
                    {/if}
                </div>
                
                <!-- Password field -->
                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        bind:value={password}
                        on:blur={validatePassword}
                        required 
                        class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                    {#if errors.password}
                        <p class="mt-1 text-sm text-red-500">{errors.password}</p>
                    {/if}
                </div>
                
                <!-- Confirm Password field -->
                <div>
                    <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm Password</label>
                    <input 
                        type="password" 
                        id="confirmPassword" 
                        name="confirmPassword" 
                        bind:value={confirmPassword}
                        on:blur={validateConfirmPassword}
                        required 
                        class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                    />
                    {#if errors.confirmPassword}
                        <p class="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                    {/if}
                </div>

                {#if successMessage}
                    <div class="text-green-600 text-sm p-2 bg-green-50 rounded border border-green-200 text-center">
                        {successMessage}
                    </div>
                {:else if errors.form}
                    <div class="text-red-500 text-sm text-center">{errors.form}</div>
                {/if}
                
                <!-- Submit button -->
                <button 
                    type="submit" 
                    class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    disabled={loading || !isFormValid}
                >
                    {#if loading}
                        <span>Registering...</span>
                    {:else}
                        <span>Register</span>
                    {/if}
                </button>
                
                <!-- Login link -->
                <div class="text-center text-sm mt-4">
                    <p>
                        Already have an account? 
                        <a href="/login" class="text-blue-600 hover:text-blue-800 font-medium">Sign in</a>
                    </p>
                </div>
            </form>
        </div>
    </div>
</div>
