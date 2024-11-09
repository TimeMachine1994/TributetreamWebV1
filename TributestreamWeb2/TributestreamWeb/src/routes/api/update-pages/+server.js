// src/routes/api/update-pages/+server.js

import { json } from '@sveltejs/kit';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export async function POST({ request }) {
    const { slug } = await request.json();
    const pagesJsonPath = join(process.cwd(), 'src', 'data', 'pages.json');

    try {
        // Read the existing JSON file
        let pagesData = { pages: [] };
        try {
            pagesData = JSON.parse(readFileSync(pagesJsonPath, 'utf-8'));
        } catch (error) {
            console.error('Error reading JSON file:', error);
            return json({ success: false, error: 'Failed to read JSON file' }, { status: 500 });
        }

        // Add the new slug
        pagesData.pages.push(slug);

        // Write the updated data back to the JSON file
        try {
            writeFileSync(pagesJsonPath, JSON.stringify(pagesData, null, 2));
        } catch (error) {
            console.error('Error writing to JSON file:', error);
            return json({ success: false, error: 'Failed to write to JSON file' }, { status: 500 });
        }

        return json({ success: true });
    } catch (error) {
        console.error('Unexpected error:', error);
        return json({ success: false, error: 'Unexpected server error' }, { status: 500 });
    }
}
