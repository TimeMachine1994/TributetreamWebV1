import { redirect } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';
// Example hooks.server.ts
 
 
export async function handle({ event, resolve }) {
  const url = new URL(event.request.url);
  const slug = url.pathname.split('/').pop();  // Assuming the slug is the last part of the path

  // Access cookies
  const jwt = event.cookies.get('jwt');
  console.log('JWT Cookie:', jwt);

  // Skip non-page requests or slugs you don't care about
  if (!slug || (!url.pathname.startsWith('/celebration-of-life-for') && !url.pathname.startsWith('/tributestream-for'))) {
    return await resolve(event);
  }

  // Load JSON file data
  const dataFilePath = path.join(process.cwd(), 'data', 'pages.json');
  let pages;

  try {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    pages = JSON.parse(data);
  } catch (error) {
    console.error('Error reading JSON file:', error);
    return await resolve(event);  // Fallback to normal resolution if there's an error
  }

  // Check if the slug is in the JSON data and if it's a v2 page
  const page = pages.find(p => p.slug === slug);

  if (page && page.v2page) {
    // If it is a "v2" page, continue handling the request within SvelteKit
    return await resolve(event);
  } else {
    // If it is not a "v2" page, redirect to WordPress
    throw redirect(302, `https://wp.tributestream.com${url.pathname}`);
  }
 
}
