import fs from 'fs';
import path from 'path';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
  const { slug, isV2 } = await request.json();
  const dataFilePath = path.join(process.cwd(), 'data', 'pages.json');

  try {
    let pages = [];

    // Check if the file exists and read data
    if (fs.existsSync(dataFilePath)) {
      const data = fs.readFileSync(dataFilePath, 'utf8');

      try {
        pages = JSON.parse(data);
      } catch (parseError) {
        console.error('Error parsing JSON file. Resetting to empty array:', parseError);
        pages = [];
      }
    }

    // Add the new page
    pages.push({ slug, v2page: isV2 });

    // Write updated data back to pages.json
    fs.writeFileSync(dataFilePath, JSON.stringify(pages, null, 2), 'utf8');

    return json({ success: true });
  } catch (error) {
    console.error('Error updating JSON file:', error);
    return json({ error: 'Failed to update JSON file' }, { status: 500 });
  }
}
