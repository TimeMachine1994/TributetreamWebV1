export async function load({ data }) {
    if (data?.redirect) {
        // This should ideally not be necessary since redirect is server-handled.
        // However, adding this as a safeguard on client-side navigation.
        window.location.href = data.redirect;
        return {};
    }
    
    return {
        ...data,
        // You can add client-side transformations here if needed.
    };
}