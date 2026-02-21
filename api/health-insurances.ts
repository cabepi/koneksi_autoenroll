import { Pool } from 'pg';
import { HealthInsuranceRepository } from '../src/data/repositories/HealthInsuranceRepository.js';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

const repository = new HealthInsuranceRepository(pool);

export default async function handler(req: any, res: any) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const insurances = await repository.getActiveHealthInsurances();
        return res.status(200).json(insurances);
    } catch (error) {
        console.error('Error fetching health insurances:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
