<script lang="ts">
    let authSection = {
        register: { email: '', password: '' },
        login: { email: '', password: '' }
    };

    let paymentSection = {
        locationId: '',
        sourceId: ''
    };

    let formSection = {
        director: {
            firstName: '',
            lastName: ''
        },
        familyMember: {
            firstName: '',
            lastName: '',
            dateOfBirth: ''
        },
        deceased: {
            firstName: '',
            lastName: '',
            dateOfBirth: '',
            dateOfPassing: ''
        },
        contact: {
            email: '',
            phone: ''
        },
        memorial: {
            locationName: '',
            locationAddress: '',
            time: '',
            date: ''
        }
    };

    async function handleRegister() {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(authSection.register)
            });
            const result = await response.json();
            alert(result.message);
        } catch (error) {
            alert('Registration failed: ' + error);
        }
    }

    async function handleLogin() {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(authSection.login)
            });
            const result = await response.json();
            alert(result.message);
        } catch (error) {
            alert('Login failed: ' + error);
        }
    }

    async function handlePayment() {
        try {
            const response = await fetch('/api/payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paymentSection)
            });
            const result = await response.json();
            alert('Payment response: ' + JSON.stringify(result));
        } catch (error) {
            alert('Payment failed: ' + error);
        }
    }

    async function handleFormSubmit() {
        try {
            const response = await fetch('/api/submit-form', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formSection)
            });
            const result = await response.json();
            alert(result.message);
        } catch (error) {
            alert('Form submission failed: ' + error);
        }
    }
</script>

<div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">API Testing Page</h1>

    <!-- Authentication Section -->
    <div class="mb-8 p-4 border rounded">
        <h2 class="text-xl font-semibold mb-4">Authentication</h2>
        
        <!-- Register -->
        <div class="mb-4">
            <h3 class="font-semibold mb-2">Register</h3>
            <input
                type="email"
                bind:value={authSection.register.email}
                placeholder="Email"
                class="border p-2 mb-2 w-full"
            />
            <input
                type="password"
                bind:value={authSection.register.password}
                placeholder="Password"
                class="border p-2 mb-2 w-full"
            />
            <button
                on:click={handleRegister}
                class="bg-blue-500 text-white px-4 py-2 rounded"
            >
                Register
            </button>
        </div>

        <!-- Login -->
        <div>
            <h3 class="font-semibold mb-2">Login</h3>
            <input
                type="email"
                bind:value={authSection.login.email}
                placeholder="Email"
                class="border p-2 mb-2 w-full"
            />
            <input
                type="password"
                bind:value={authSection.login.password}
                placeholder="Password"
                class="border p-2 mb-2 w-full"
            />
            <button
                on:click={handleLogin}
                class="bg-green-500 text-white px-4 py-2 rounded"
            >
                Login
            </button>
        </div>
    </div>

    <!-- Payment Section -->
    <div class="mb-8 p-4 border rounded">
        <h2 class="text-xl font-semibold mb-4">Payment</h2>
        <input
            type="text"
            bind:value={paymentSection.locationId}
            placeholder="Location ID"
            class="border p-2 mb-2 w-full"
        />
        <input
            type="text"
            bind:value={paymentSection.sourceId}
            placeholder="Source ID"
            class="border p-2 mb-2 w-full"
        />
        <button
            on:click={handlePayment}
            class="bg-purple-500 text-white px-4 py-2 rounded"
        >
            Process Payment
        </button>
    </div>

    <!-- Form Submission Section -->
    <div class="mb-8 p-4 border rounded">
        <h2 class="text-xl font-semibold mb-4">Form Submission</h2>
        
        <!-- Director Information -->
        <div class="mb-4">
            <h3 class="font-semibold mb-2">Director Information</h3>
            <input
                type="text"
                bind:value={formSection.director.firstName}
                placeholder="First Name"
                class="border p-2 mb-2 w-full"
            />
            <input
                type="text"
                bind:value={formSection.director.lastName}
                placeholder="Last Name"
                class="border p-2 mb-2 w-full"
            />
        </div>

        <!-- Family Member Information -->
        <div class="mb-4">
            <h3 class="font-semibold mb-2">Family Member Information</h3>
            <input
                type="text"
                bind:value={formSection.familyMember.firstName}
                placeholder="First Name"
                class="border p-2 mb-2 w-full"
            />
            <input
                type="text"
                bind:value={formSection.familyMember.lastName}
                placeholder="Last Name"
                class="border p-2 mb-2 w-full"
            />
            <input
                type="date"
                bind:value={formSection.familyMember.dateOfBirth}
                class="border p-2 mb-2 w-full"
            />
        </div>

        <!-- Deceased Information -->
        <div class="mb-4">
            <h3 class="font-semibold mb-2">Deceased Information</h3>
            <input
                type="text"
                bind:value={formSection.deceased.firstName}
                placeholder="First Name"
                class="border p-2 mb-2 w-full"
            />
            <input
                type="text"
                bind:value={formSection.deceased.lastName}
                placeholder="Last Name"
                class="border p-2 mb-2 w-full"
            />
            <input
                type="date"
                bind:value={formSection.deceased.dateOfBirth}
                class="border p-2 mb-2 w-full"
            />
            <input
                type="date"
                bind:value={formSection.deceased.dateOfPassing}
                class="border p-2 mb-2 w-full"
            />
        </div>

        <!-- Contact Information -->
        <div class="mb-4">
            <h3 class="font-semibold mb-2">Contact Information</h3>
            <input
                type="email"
                bind:value={formSection.contact.email}
                placeholder="Email"
                class="border p-2 mb-2 w-full"
            />
            <input
                type="tel"
                bind:value={formSection.contact.phone}
                placeholder="Phone"
                class="border p-2 mb-2 w-full"
            />
        </div>

        <!-- Memorial Information -->
        <div class="mb-4">
            <h3 class="font-semibold mb-2">Memorial Information</h3>
            <input
                type="text"
                bind:value={formSection.memorial.locationName}
                placeholder="Location Name"
                class="border p-2 mb-2 w-full"
            />
            <input
                type="text"
                bind:value={formSection.memorial.locationAddress}
                placeholder="Location Address"
                class="border p-2 mb-2 w-full"
            />
            <input
                type="time"
                bind:value={formSection.memorial.time}
                class="border p-2 mb-2 w-full"
            />
            <input
                type="date"
                bind:value={formSection.memorial.date}
                class="border p-2 mb-2 w-full"
            />
        </div>

        <button
            on:click={handleFormSubmit}
            class="bg-orange-500 text-white px-4 py-2 rounded"
        >
            Submit Form
        </button>
    </div>
</div>

<style>
    input {
        max-width: 400px;
    }
</style>
