import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import { NotificationService } from '../../../../src/services/NotificationService.js';

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
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const user = authenticate(req);
    if (!user) {
        return res.status(401).json({ error: 'No autorizado / Token expirado' });
    }

    const requestId = req.query.id as string;
    if (!requestId) {
        return res.status(400).json({ error: 'Missing request ID' });
    }

    const { action, reason_id, notes } = req.body;
    
    // Validate Action
    const validActions = ['APPROVE', 'OBSERVE', 'REJECT'];
    if (!action || !validActions.includes(action)) {
        return res.status(400).json({ error: 'Invalid action provided.' });
    }

    // Map Action to Target Status
    const actionToStatusMap: Record<string, string> = {
        'APPROVE': 'CONFIRMED',
        'OBSERVE': 'OBSERVED',
        'REJECT': 'REJECTED'
    };
    
    const targetStatus = actionToStatusMap[action];

    // Validate Reason (mandatory for non-approvals)
    if ((action === 'OBSERVE' || action === 'REJECT') && !reason_id) {
        return res.status(400).json({ error: `A reason is required when taking action: ${action}` });
    }

    const client = await getPool().connect();

    try {
        await client.query('BEGIN');

        // Verify request exists
        const requestCheck = await client.query('SELECT status, full_name, email FROM koneksi_autoenroll.doctor_enrollment_requests WHERE id = $1', [requestId]);
        if (requestCheck.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Enrollment Request not found' });
        }

        const currentStatus = requestCheck.rows[0].status;

        // Prevent redundant status updates
        if (currentStatus === targetStatus) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: `Request is already marked as ${targetStatus}` });
        }

        // 1. Update master table
        const updateParams: any[] = [targetStatus, requestId];
        let setFields = 'status = $1, updated_at = NOW()';
        
        let paramIdx = 3;
        if (reason_id) {
            setFields += `, evaluation_reason_id = $${paramIdx}`;
            updateParams.push(reason_id);
            paramIdx++;
        }
        
        if (notes !== undefined) {
            setFields += `, evaluation_notes = $${paramIdx}`;
            updateParams.push(notes);
        }

        const updateQuery = `
            UPDATE koneksi_autoenroll.doctor_enrollment_requests 
            SET ${setFields}
            WHERE id = $2 
            RETURNING id
        `;

        await client.query(updateQuery, updateParams);

        // 2. Insert into history tracking
        await client.query(`
            INSERT INTO koneksi_autoenroll.enrollment_request_status_history 
            (request_id, status, changed_by_email) 
            VALUES ($1, $2, $3)
        `, [requestId, targetStatus, user.email || 'unknown@admin.com']);

        // 3. Send Email Notification
        let reasonDescription = '';
        if (reason_id) {
            const reasonCheck = await client.query('SELECT description FROM koneksi_autoenroll.evaluation_reasons WHERE id = $1', [reason_id]);
            if ((reasonCheck.rowCount ?? 0) > 0) {
                reasonDescription = reasonCheck.rows[0].description;
            }
        }

        try {
            const notificationService = new NotificationService();
            const doctorName = requestCheck.rows[0].full_name || 'Doctor(a)';
            const doctorEmail = requestCheck.rows[0].email;
            const frontendUrl = process.env.VITE_APP_URL || 'http://localhost:5173';
            let emailHtml = '';

            if (targetStatus === 'CONFIRMED') {
                emailHtml = notificationService.getEvaluationApprovedEmailTemplate(doctorName);
                await notificationService.sendEmail(doctorEmail, '¡Alta Médica Aprobada! - Koneksi', emailHtml);
            } else if (targetStatus === 'OBSERVED') {
                emailHtml = notificationService.getEvaluationObservedEmailTemplate(doctorName, reasonDescription, notes || '', requestId, frontendUrl);
                await notificationService.sendEmail(doctorEmail, 'Observación en su Solicitud - Koneksi', emailHtml);
            } else if (targetStatus === 'REJECTED') {
                emailHtml = notificationService.getEvaluationRejectedEmailTemplate(doctorName, reasonDescription, notes || '');
                await notificationService.sendEmail(doctorEmail, 'Resolución de Solicitud de Enrolamiento - Koneksi', emailHtml);
            }
        } catch (emailError) {
            console.error('Error sending evaluation email:', emailError);
            // Non-blocking: continue committing the evaluation decision even if the email failed
        }

        await client.query('COMMIT');
        
        return res.status(200).json({ success: true, new_status: targetStatus });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('API Error processing request evaluation:', error);
        return res.status(500).json({ error: 'Internal Server Error processing decision' });
    } finally {
        client.release();
    }
}
