import { json } from '@sveltejs/kit';
import { Client } from 'square';
import { randomUUID } from 'crypto';
import { SQUARE_SANDBOX_ACCESS_TOKEN } from '$env/static/private';
// according to (https://developer.squareup.com/docs/payments-api/take-payments)
// we need to  Flag payments that are buyer initiated or seller initiated
let customer_initiated = true;
// Add a toJSON method for BigInt to handle serialization
BigInt.prototype.toJSON = function () {
    return this.toString();
};

// Initialize the Square Client
const { paymentsApi } = new Client({
    accessToken: SQUARE_SANDBOX_ACCESS_TOKEN,
    environment: 'sandbox',
});

export async function POST({ request }) {
    console.log('POST handler invoked');

    // Log the environment setup
    console.log('Square API Environment: sandbox');
    console.log('Access Token:', SQUARE_SANDBOX_ACCESS_TOKEN ? 'Loaded' : 'Not Loaded');

    try {
        // Parse the request body and log it
        const { locationId, sourceId } = await request.json();
        console.log('Request JSON parsed successfully:');
         console.log('Source ID:', sourceId);
        
        // Prepare the payment payload
        const paymentPayload = {
            customer_initiated,
            sourceId,
            idempotencyKey: randomUUID(),
            amountMoney: {
                amount: 100, // Example fixed amount in cents
                currency: 'USD',
            },
        };
        console.log('Payment Payload:', JSON.stringify(paymentPayload, null, 2));

        // Call the Square Payments API
        console.log('Calling Square Payments API...');
        const { result } = await paymentsApi.createPayment(paymentPayload);
        console.log('Square API responded with:');
        console.log(JSON.stringify(result, null, 2));

        // Return the successful response
        return json(result);
    } catch (error) {
        // Log the error with details
        console.error('Error occurred while processing payment:', error);

        // Check for error response from the Square API
        if (error.response) {
            console.error('Error Response Details:', error.response);
        }

        // Return an error response
        return json(
            {
                success: false,
                error: error.message || 'An unexpected error occurred.',
                details: error.response || null,
            },
            { status: 500 }
        );
    }
}
