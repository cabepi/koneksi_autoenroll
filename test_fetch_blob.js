import dotenv from 'dotenv';
dotenv.config();
import fetch from 'node-fetch'; // or use global fetch in Node 20+

async function run() {
  const url = 'https://4h2zdrozf3ruawif.private.blob.vercel-storage.com/condiciones_de_uso_plataforma_koneksi.pdf';
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  
  try {
    // Attempt 1: Authorization header
    const r1 = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    console.log("Header response:", r1.status);
    
    // Attempt 2: downloadUrl?
    // Let's also check if vercel blob SDK is installed and what it exports
  } catch (e) {
    console.error(e);
  }
}
run();
