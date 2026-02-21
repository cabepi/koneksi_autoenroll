import type { VercelRequest, VercelResponse } from '@vercel/node';
import { OtpService } from '../../src/services/OtpService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { otpId, code } = req.body;

    if (!otpId || !code) {
        return res.status(400).json({ error: 'ID de OTP y código son requeridos' });
    }

    try {
        const otpService = new OtpService();
        const isValid = await otpService.validateOtp(otpId, code);

        if (isValid) {
            return res.status(200).json({ message: 'Código válido', valid: true });
        } else {
            return res.status(400).json({ error: 'Código inválido o expirado', valid: false });
        }
    } catch (error) {
        console.error('API Error validating OTP:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
