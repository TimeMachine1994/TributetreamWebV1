<!-- @migration-task Error while migrating Svelte code: Unexpected character '“'
https://svelte.dev/e/js_parse_error -->
<script lang="ts">
  let {appId, locationId} = $props();

    let card;
    async function handlePaymentMethodSubmission() {
  try {
    paymentStatus = “”;
    const token = await tokenize(card);
    const paymentResponse = await fetch('/api/payment', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        locationId,
        sourceId: token
      })
    });

    if (paymentResponse.ok) {
      paymentStatus = 'Payment completed';
    } else {
      const errorBody = await paymentResponse.text();
      throw new Error(errorBody);
    }
  } catch (e) {
    paymentStatus = 'Payment failed';
    console.error(e.message);
  }
}



  async function tokenize(paymentMethod) {
  const tokenResult = await paymentMethod.tokenize();
  if (tokenResult.status === 'OK') {
    return tokenResult.token;
  } else {
    let errorMessage = `Tokenization failed with status: ${tokenResult.status}`;
    if (tokenResult.errors) {
      errorMessage += ` and errors: ${JSON.stringify(tokenResult.errors)}`;
    }
    throw new Error(errorMessage);
  }
}
  async function initializePaymentForm() {
    if (!Square) {
      throw new Error('Square.js failed to load properly');
    }
    const payments = Square.payments(appId, locationId);
    try {
      card = await payments.card();
      await card.attach('#card-container');
    } catch (e) {
      console.error('Initializing Card failed', e);
      return;
    }
  }
</script>
<form on:submit|preventDefault={handlePaymentMethodSubmission}>
  {#await setup()}
    <p>Loading...</p>
  {:catch error}
    <p>{error}</p>
  {/await}
  <div id="card-container" />
  <button>Pay $1.00</button>
</form>
{#if paymentStatus}
  <div id="payment-status-container">{paymentStatus}</div>
{/if}
