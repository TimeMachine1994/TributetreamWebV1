import { readFileSync } from 'fs';
import { join } from 'path';

export async function load({ params }) {
  const { slug } = params;

  // Read the pages.json file
  const pagesJsonPath = join(process.cwd(), 'src', 'data', 'pages.json');
  const pagesData = JSON.parse(readFileSync(pagesJsonPath, 'utf-8'));

  // Check if the slug exists in our JSON file
  if (pagesData.pages.includes(slug)) {
    // Here we can also fetch any additional data needed for the template
    return {
      template: 'celebration-v2',
      slug: slug,
      // Add any other data you want to pass to the template
    };
  }

  if (slug.startsWith("celebration") || slug.startsWith("tributestream-for")) {
    return {
      status: 302,
      headers: {
        location: `https://wp.tributestream.com/${slug}`,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    };
  }

  return { status: 404, body: "Content not found" };
}
