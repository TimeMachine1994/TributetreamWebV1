import { error } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

export async function load({ fetch }) {
    const response = await fetch('http://wp.tributestream.com/wp-json/tributestream/v1/tribute');
 
    if (!response.ok) {
        throw error(response.status, 'Failed to fetch tributes');
    }

    const tributes = await response.json();
    console.log('Loaded tributes:', tributes.length); // Add logging

    return { tributes };
}
