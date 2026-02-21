import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SpecialtyRepository } from '../src/data/repositories/SpecialtyRepository.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const searchQuery = req.query.q as string;

    if (!searchQuery || searchQuery.length < 4) {
        return res.status(400).json({ error: 'El término de búsqueda debe tener al menos 4 caracteres' });
    }

    try {
        const repo = new SpecialtyRepository();
        const specialties = await repo.searchByFallbackName(searchQuery);
        return res.status(200).json(specialties);
    } catch (error) {
        console.error('Error searching specialties:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
