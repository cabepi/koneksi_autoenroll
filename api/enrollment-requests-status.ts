import { Pool } from 'pg';
import { EnrollmentRequestRepository } from '../src/data/repositories/EnrollmentRequestRepository.js';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

const repository = new EnrollmentRequestRepository(pool);

export default async function handler(req: any, res: any) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // Extract ID. In Vercel, it comes in req.query.id. In express, we map req.params.id to req.query.id.
        const id = req.query.id;

        if (!id) {
            return res.status(400).json({ error: 'Request ID is required' });
        }

        const requestData = await repository.getEnrollmentRequestById(id);

        if (!requestData) {
            return res.status(404).json({ error: 'Enrollment request not found' });
        }

        return res.status(200).json(requestData);
    } catch (error: any) {
        console.error('Error fetching enrollment request:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
