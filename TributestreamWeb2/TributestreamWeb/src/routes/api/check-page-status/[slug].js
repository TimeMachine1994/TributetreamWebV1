import { json } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

export async function POST({ request }) {
    const { slug } = await request.json();
    
    // Read the pages JSON file
    const pagesData = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), 'src/lib/pages.json'), 'utf-8')
    );
    
    return json({
        isV2: pagesData.pages.includes(slug),
        slug: slug
    });
}
