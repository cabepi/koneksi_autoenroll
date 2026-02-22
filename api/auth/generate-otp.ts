import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import { OtpService } from '../../src/services/OtpService.js';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'El correo electrónico es requerido' });
    }

    try {
        // Valida que el email exista en la tabla users
        const { rows } = await pool.query('SELECT * FROM koneksi_autoenroll.users WHERE email = $1', [email]);

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Usuario no autorizado. Verifica que tu correo esté registrado.' });
        }

        const otpService = new OtpService();
        // The generateAndSendOtp will handle the token creation and email sending via NotificationService
        const generatedOtpId = await otpService.generateAndSendOtp(email, 'backoffice');

        if (generatedOtpId) {
            return res.status(200).json({ message: 'OTP enviado exitosamente', otpId: generatedOtpId });
        } else {
            return res.status(500).json({ error: 'Error al enviar OTP al correo.' });
        }
    } catch (error) {
        console.error('API Error generating Backoffice OTP:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
