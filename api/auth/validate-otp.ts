import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';
import { OtpService } from '../../src/services/OtpService.js';
import jwt from 'jsonwebtoken';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { email, otpId, code } = req.body;

    if (!email || !otpId || !code) {
        return res.status(400).json({ error: 'Email, otpId y código son requeridos' });
    }

    try {
        // Doble validación: el usuario debe seguir existiendo por seguridad
        const { rows } = await pool.query('SELECT * FROM koneksi_autoenroll.users WHERE email = $1', [email]);

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Usuario no autorizado. Contacta a soporte si crees que esto es un error.' });
        }

        const user = rows[0];

        // Verificar match de email e id del OTP antes de validar el código
        const otpResult = await pool.query('SELECT identifier FROM koneksi_autoenroll.otps WHERE id = $1', [otpId]);
        if (otpResult.rows.length === 0 || otpResult.rows[0].identifier !== email) {
            return res.status(401).json({ error: 'Código inválido para este correo electrónico. Por favor vuelve a intentarlo.' });
        }

        const otpService = new OtpService();
        const isValid = await otpService.validateOtp(otpId, code);

        if (isValid) {
            const token = jwt.sign(
                { email: user.email, name: user.full_name },
                process.env.JWT_SECRET || 'supersecret_fallback_key',
                { expiresIn: '24h' }
            );

            return res.status(200).json({
                message: 'Autenticación exitosa',
                token,
                user: { email: user.email, name: user.full_name }
            });
        } else {
            return res.status(401).json({ error: 'Código inválido o ha expirado. Verifica el código enviado a tu correo.' });
        }
    } catch (error) {
        console.error('API Error validating Backoffice OTP:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
