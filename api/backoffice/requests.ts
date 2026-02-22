import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

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

    try {
        // Query basic info alongside latest status
        const queryText = `
            SELECT 
                er.id, 
                er.full_name, 
                er.email, 
                er.created_at,
                (
                    SELECT status 
                    FROM koneksi_autoenroll.enrollment_request_status_history h 
                    WHERE h.request_id = er.id 
                    ORDER BY h.changed_at DESC 
                    LIMIT 1
                ) as latest_status
            FROM koneksi_autoenroll.doctor_enrollment_requests er
            ORDER BY er.created_at DESC;
        `;
        const { rows } = await pool.query(queryText);

        return res.status(200).json(rows);
    } catch (error) {
        console.error('API Error fetching backoffice requests:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
