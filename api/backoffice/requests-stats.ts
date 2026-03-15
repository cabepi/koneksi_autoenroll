import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_fallback_key';

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
        // Obtenemos el conteo agrupado por status
        const queryText = `
            SELECT status, COUNT(*)::int as count 
            FROM koneksi_autoenroll.doctor_enrollment_requests 
            GROUP BY status;
        `;
        const { rows } = await pool.query(queryText);

        // Transformamos el resultado a un objeto plano { PENDING_CONFIRMATION: X, CONFIRMED: Y, REJECTED: Z }
        const stats = rows.reduce((acc: Record<string, number>, row: any) => {
            acc[row.status] = row.count;
            return acc;
        }, {});

        // Garantizamos que estén definidos con al menos 0 si no hay en DB
        const result = {
            PENDING_CONFIRMATION: stats['PENDING_CONFIRMATION'] || 0,
            OBSERVED: stats['OBSERVED'] || 0,
            CONFIRMED: stats['CONFIRMED'] || 0,
            REJECTED: stats['REJECTED'] || 0,
            CORRECTED: stats['CORRECTED'] || 0,
        };

        return res.status(200).json(result);
    } catch (error) {
        console.error('API Error fetching backoffice stats:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
