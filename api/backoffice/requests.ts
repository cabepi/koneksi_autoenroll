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
        const { status, page = '1', limit = '10' } = req.query;

        const pageNum = Math.max(1, parseInt(page as string, 10));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
        const offset = (pageNum - 1) * limitNum;

        // Base where clause and params setup for count and payload queries
        let whereClause = '';
        const queryParams: any[] = [];
        
        if (status && typeof status === 'string') {
            whereClause = ` WHERE er.status = $1`;
            queryParams.push(status);
        }

        // --- 1. Get the Total Count for Pagination Meta ---
        const countQueryText = `SELECT COUNT(*)::int as total FROM koneksi_autoenroll.doctor_enrollment_requests er${whereClause};`;
        const { rows: countRows } = await pool.query(countQueryText, queryParams);
        const totalRecords = countRows.length > 0 ? countRows[0].total : 0;
        const totalPages = Math.ceil(totalRecords / limitNum);

        // --- 2. Get the Actual Paginated Data ---
        const dataQueryText = `
            SELECT 
                er.id, 
                er.full_name, 
                er.email, 
                er.created_at,
                er.status as latest_status
            FROM koneksi_autoenroll.doctor_enrollment_requests er
            ${whereClause}
            ORDER BY er.created_at DESC
            LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2};
        `;
        
        const dataParams = [...queryParams, limitNum, offset];
        const { rows: dataRows } = await pool.query(dataQueryText, dataParams);

        // --- 3. Return Paginated Structure ---
        return res.status(200).json({
            data: dataRows,
            meta: {
                totalRecords,
                page: pageNum,
                limit: limitNum,
                totalPages
            }
        });
    } catch (error) {
        console.error('API Error fetching backoffice requests:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
