import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

let pool: Pool;
function getPool() {
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
        });
    }
    return pool;
}

const authenticate = (req: VercelRequest): any | null => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;

    const token = authHeader.split(' ')[1];
    if (!token) return null;

    try {
        return jwt.verify(token, process.env.JWT_SECRET || 'supersecret_fallback_key');
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

    const type = req.query.type as string; // 'OBSERVE' | 'REJECT' | undefined

    try {
        let query = 'SELECT id, type, description FROM koneksi_autoenroll.evaluation_reasons WHERE is_active = true';
        const params: any[] = [];

        if (type && (type === 'OBSERVE' || type === 'REJECT')) {
            query += ' AND type = $1';
            params.push(type);
        }

        query += ' ORDER BY id ASC';

        const result = await getPool().query(query, params);
        
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error('API Error fetching evaluation reasons:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
