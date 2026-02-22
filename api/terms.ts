import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const url = process.env.TERMS_PDF_PRIVATE_URL;
        const token = process.env.BLOB_READ_WRITE_TOKEN;

        if (!url || !token) {
            return res.status(500).json({ error: 'Configuration error: Missing URL or token.' });
        }

        // Fetch the private blob using the secret token
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch blob: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="condiciones_de_uso_plataforma_koneksi.pdf"');

        return res.status(200).send(buffer);
    } catch (error) {
        console.error('Error generating download URL:', error);
        return res.status(500).json({ error: 'Failed to access document.' });
    }
}
