import type { VercelRequest, VercelResponse } from '@vercel/node';
import { OtpService } from '../../src/services/OtpService.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { identifier } = req.body;

    if (!identifier) {
        return res.status(400).json({ error: 'Identificador es requerido' });
    }

    try {
        const otpService = new OtpService();
        const generatedOtpId = await otpService.generateAndSendOtp(identifier);

        if (generatedOtpId) {
            return res.status(200).json({ message: 'OTP enviado exitosamente', otpId: generatedOtpId });
        } else {
            return res.status(500).json({ error: 'Error al enviar OTP' });
        }
    } catch (error) {
        console.error('API Error generating OTP:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
