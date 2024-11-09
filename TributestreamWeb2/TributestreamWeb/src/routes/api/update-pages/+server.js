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
        }
        
        // Add the new slug
        pagesData.pages.push(slug);
        
        // Write the updated data back to the JSON file
        writeFileSync(pagesJsonPath, JSON.stringify(pagesData, null, 2));
        
        return json({ success: true });
    } catch (error) {
        console.error('Error updating JSON file:', error);
        return json({ success: false, error: error.message }, { status: 500 });
    }
}
