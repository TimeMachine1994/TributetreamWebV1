<script lang="ts">
  interface PaymentMethod {
    tokenize: () => Promise<{
      status: string;
      token?: string;
      errors?: any[];
    }>;
    attach: (selector: string) => Promise<void>;
  }

  let { appId, locationId, initialData, isVisible = false } = $props();
  let paymentStatus = $state('');
  let card = $state<PaymentMethod | null>(null);
  let billingData = $state({
    firstName: initialData.firstName || '',
    lastName: initialData.lastName || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    address: initialData.address || '',
  });

  async function initializePaymentForm() {
    try {
      // @ts-ignore - Square is loaded globally
      if (!window.Square) {
        throw new Error('Square.js failed to load properly');
      }
      // @ts-ignore - Square is loaded globally
      const payments = window.Square.payments(appId, locationId);
      const newCard = await payments.card();
      await newCard.attach('#card-container');
      card = newCard;
    } catch (e: unknown) {
      console.error('Initializing Card failed', e instanceof Error ? e.message : String(e));
      return;
    }
  }

  async function handlePaymentMethodSubmission() {
    try {
      if (!card) {
        throw new Error('Card not initialized');
      }
      paymentStatus = 'Processing payment...';
      const token = await tokenize(card);
      const paymentResponse = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          locationId,
          sourceId: token,
        }),
      });

      if (paymentResponse.ok) {
        paymentStatus = 'Payment completed';
      } else {
        const errorBody = await paymentResponse.text();
        throw new Error(errorBody);
      }
    } catch (e: unknown) {
      paymentStatus = 'Payment failed';
      console.error(e instanceof Error ? e.message : String(e));
    }
  }

  async function tokenize(paymentMethod: PaymentMethod): Promise<string> {
    const tokenResult = await paymentMethod.tokenize();
    if (tokenResult.status === 'OK' && tokenResult.token) {
      return tokenResult.token;
    } else {
      let errorMessage = `Tokenization failed with status: ${tokenResult.status}`;
      if (tokenResult.errors) {
        errorMessage += ` and errors: ${JSON.stringify(tokenResult.errors)}`;
      }
      throw new Error(errorMessage);
    }
  }

  const handleSubmit = () => {
    console.log('Billing Form Submitted:', billingData);
    alert('Form submitted successfully!');
  };
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-100" class:hidden={!isVisible}>
  <div class="bg-white shadow-md rounded-lg p-8 space-y-6 max-w-lg w-full transition-all duration-300">
    <h2 class="text-2xl font-bold text-center text-gray-700">Billing Information</h2>

    <form class="space-y-6" onsubmit={handleSubmit}>
      <!-- First Name -->
      <div>
        <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">
          First Name
        </label>
        <input
          type="text"
          id="firstName"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          bind:value={billingData.firstName}
          placeholder="Enter your first name"
        />
      </div>

      <!-- Last Name -->
      <div>
        <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">
          Last Name
        </label>
        <input
          type="text"
          id="lastName"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          bind:value={billingData.lastName}
          placeholder="Enter your last name"
        />
      </div>

      <!-- Email -->
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          bind:value={billingData.email}
          placeholder="Enter your email address"
        />
      </div>

      <!-- Phone -->
      <div>
        <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">
          Phone
        </label>
        <input
          type="tel"
          id="phone"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          bind:value={billingData.phone}
          placeholder="Enter your phone number"
        />
      </div>

      <!-- Address -->
      <div>
        <label for="address" class="block text-sm font-medium text-gray-700 mb-1">
          Address
        </label>
        <textarea
          id="address"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows="3"
          bind:value={billingData.address}
          placeholder="Enter your address"
        ></textarea>
      </div>
    </form>

    <div class="mt-8">
      <form onsubmit={handlePaymentMethodSubmission}>
        {#await initializePaymentForm()}
          <p class="text-center text-gray-500">Loading payment form...</p>
        {:catch error}
          <p class="text-center text-red-500">{error}</p>
        {/await}
        <div id="card-container" class="mt-6"></div>
        <button
          type="submit"
          class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition-colors duration-200 mt-4"
        >
          Pay $1.00
        </button>
      </form>
    </div>

    {#if paymentStatus}
      <div id="payment-status-container" class="text-center text-gray-700 mt-4">
        {paymentStatus}
      </div>
    {/if}
  </div>
</div>
