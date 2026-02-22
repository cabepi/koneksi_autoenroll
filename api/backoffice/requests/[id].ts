import type { VercelRequest, VercelResponse } from '@vercel/node';
import { EnrollmentRequestRepository } from '../../../src/data/repositories/EnrollmentRequestRepository.js';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

const repository = new EnrollmentRequestRepository(pool);
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_fallback_key';

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

    const id = req.query.id as string;

    if (!id) {
        return res.status(400).json({ error: 'ID is required' });
    }

    try {
        const result = await repository.getEnrollmentRequestById(id);

        if (!result) {
            return res.status(404).json({ error: 'Not Found' });
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error('API Error fetching detailed backoffice request status:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
