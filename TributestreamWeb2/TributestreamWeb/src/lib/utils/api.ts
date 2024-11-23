export function apiFetch(url: string, options?: RequestInit): Promise<Response> {
    return fetch(url, options)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response;
        });
}  
export function validateToken(token: string): boolean {
    // Basic validation: check if the token is a non-empty string
    if (typeof token !== 'string' || token.trim() === '') {
        return false;
    }
    // Further validation logic can be added here
    return true;
}
