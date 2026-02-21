import { Pool } from 'pg';
import { MedicalCenterRepository } from '../src/data/repositories/MedicalCenterRepository.js';

// Initialize connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

export default async function handler(req: any, res: any) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const query = req.query.q;

    if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid search query field "q"' });
    }

    try {
        const repo = new MedicalCenterRepository(pool);
        const centers = await repo.searchCenters(query);
        return res.status(200).json(centers);
    } catch (error) {
        console.error('Error searching medical centers:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
