import type { Request, Response } from 'express';

// Vercel Serverless Proxy function example (for production, Vercel reverse proxies or rewrites can be used, but this is a programmatic approach)
export default async function handler(req: Request, res: Response) {
    if (req.method !== 'POST' && req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const UNIPAGO_API_URL = process.env.UNIPAGO_API_URL || 'https://api.unipago.example.com';

    try {
        const fetchRes = await fetch(`${UNIPAGO_API_URL}${req.url.replace('/api/proxy', '')}`, {
            method: req.method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.UNIPAGO_API_KEY}`,
            },
            body: req.method === 'POST' ? JSON.stringify(req.body) : undefined,
        });

        const data = await fetchRes.json();
        return res.status(fetchRes.status).json(data);
    } catch (error) {
        console.error('Proxy error', error);
        return res.status(500).json({ error: 'Proxy implementation error' });
    }
}
