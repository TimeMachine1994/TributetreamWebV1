import { json } from '@sveltejs/kit';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export async function POST({ request }) {
    const { slug } = await request.json();
    const pagesJsonPath = join(process.cwd(), 'src', 'data', 'pages.json');
    
    try {
        const pagesData = JSON.parse(readFileSync(pagesJsonPath, 'utf-8'));
        pagesData.pages.push(slug);
        writeFileSync(pagesJsonPath, JSON.stringify(pagesData, null, 2));
        
        return json({ success: true });
    } catch (error) {
        return json({ success: false, error: error.message }, { status: 500 });
    }
}
