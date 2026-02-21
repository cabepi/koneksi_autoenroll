import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { cedula } = req.body;

    if (!cedula) {
        return res.status(400).json({ error: 'Cédula es requerida' });
    }

    const apiKey = process.env.JCE_API_KEY;
    const apiKeySec = process.env.JCE_API_KEY_SEC;
    const apiUrl = process.env.JCE_API_URL;

    if (!apiKey || !apiKeySec || !apiUrl) {
        console.error('Missing JCE API credentials in environment.');
        return res.status(500).json({ error: 'Configuración de servidor incompleta.' });
    }

    try {
        const response = await fetch(`${apiUrl}/${cedula}/gestionar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'xpi-key-sec': apiKeySec
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error JCE API:', response.status, errorText);
            return res.status(response.status).json({ error: 'Error al consultar JCE' });
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching JCE:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
