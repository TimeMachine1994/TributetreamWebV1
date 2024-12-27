// import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import { error, json } from '@sveltejs/kit';
// import 'dotenv/config'

// const s3Client = new S3Client({
//   region: "auto",
//   endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
//   credentials: {
//     accessKeyId: process.env.R2_ACCESS_KEY_ID,
//     secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
//   },
// });

// export async function GET({ url }) {
//   const filename = url.searchParams.get('filename');
  
//   if (!filename) {
//     throw error(400, 'Filename is required');
//   }

//   const command = new GetObjectCommand({
//     Bucket: process.env.R2_BUCKET_NAME,
//     Key: filename,
//   });

//   try {
//     const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
//     return json({ url: presignedUrl });
//   } catch (err) {
//     console.error('Error generating presigned URL:', err);
//     throw error(500, 'Error generating presigned URL');
//   };

  