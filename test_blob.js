import { put } from '@vercel/blob';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  try {
    const base64Data = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    const buffer = Buffer.from(base64Data, 'base64');

    const path = `solicitudes_enrolamiento_medicos/test/biometric_scan.png`;
    console.log("Token present?", !!process.env.BLOB_READ_WRITE_TOKEN);

    const blob = await put(path, buffer, {
      access: 'public',
      contentType: 'image/png',
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    console.log("Uploaded successfully:", blob.url);
  } catch (e) {
    console.error("Vercel Blob Upload failed:", e);
  }
}
run();
