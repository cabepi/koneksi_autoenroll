import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_fallback_key';
const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

// Middleware logic for Vercel Serverless
const authenticate = (req: VercelRequest): any | null => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;

    const token = authHeader.split(' ')[1];
    if (!token) return null;

    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (e) {
        return null;
    }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const user = authenticate(req);
    if (!user) {
        return res.status(401).json({ error: 'No autorizado / Token expirado' });
    }

    const url = req.query.url as string;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        // Fetch the blob from Vercel using the secure server token
        const fetchOptions: RequestInit = {};

        // Vercel blob requires authorization for private blobs
        if (BLOB_READ_WRITE_TOKEN) {
            fetchOptions.headers = {
                'Authorization': `Bearer ${BLOB_READ_WRITE_TOKEN}`
            };
        }

        const blobResponse = await fetch(url, fetchOptions);

        if (!blobResponse.ok) {
            console.error(`Error fetching blob (${blobResponse.status}):`, await blobResponse.text());
            return res.status(blobResponse.status).json({ error: 'Error al recuperar el medio remoto' });
        }

        const contentType = blobResponse.headers.get('content-type') || 'application/octet-stream';
        const buffer = Buffer.from(await blobResponse.arrayBuffer());

        res.setHeader('Content-Type', contentType);
        // Cache control para mejorar performance en imágenes
        res.setHeader('Cache-Control', 'private, max-age=3600');
        
        return res.status(200).send(buffer);
    } catch (error) {
        console.error('API Error fetching secure media:', error);
        return res.status(500).json({ error: 'Internal Server Error fetching media' });
    }
}
