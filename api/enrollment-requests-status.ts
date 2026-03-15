import { Pool } from 'pg';
import { EnrollmentRequestRepository } from '../src/data/repositories/EnrollmentRequestRepository.js';

import { put } from '@vercel/blob';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

const repository = new EnrollmentRequestRepository(pool);

export default async function handler(req: any, res: any) {
    if (req.method !== 'GET' && req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const id = req.query.id;

        if (!id) {
            return res.status(400).json({ error: 'Request ID is required' });
        }

        if (req.method === 'GET') {
            const requestData = await repository.getEnrollmentRequestById(id);

            if (!requestData) {
                return res.status(404).json({ error: 'Enrollment request not found' });
            }

            return res.status(200).json(requestData);
        }

        if (req.method === 'PUT') {
            const body = req.body;

            if (!body || !body.email) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            // Update main record
            await repository.update(id, {
                identificationNumber: body.identificationNumber || '', // Readonly mostly
                fullName: body.fullName || '',
                medicalLicense: body.medicalLicense || '',
                registrationDate: body.registrationDate || '',
                specialties: body.specialties || [],
                email: body.email,
                emailVerified: body.emailVerified || false,
                phone: body.phone || '',
                biometricImageUrl: body.biometricImageUrl || null,
                teamMembers: body.teamMembers || [],
                medicalCenters: body.medicalCenters || [],
                arsProviders: body.arsProviders || [],
            });

            // Handle Biometric Image Update if any
            if (body.biometricImageBase64) {
                try {
                    const base64Data = body.biometricImageBase64.replace(/^data:image\/\w+;base64,/, '');
                    const buffer = Buffer.from(base64Data, 'base64');
                    // Must have id and cedula for the path
                    const path = `doctor_enrollment_requests/${id}/${body.identificationNumber}/biometric_scan.jpg`;

                    const blob = await put(path, buffer, {
                        access: 'private',
                        contentType: 'image/jpeg',
                        token: process.env.BLOB_READ_WRITE_TOKEN
                    });

                    await repository.updateBiometricUrl(id, blob.url);
                } catch (imageError: any) {
                    console.error('Error uploading image during PUT.', imageError);
                    throw new Error(`Fallo al subir nueva foto a Vercel Blob: ${imageError.message || imageError}`);
                }
            }

            // Insert 'CORRECTED' history to send back to review
            await repository.insertStatusHistory(id, 'CORRECTED', body.email);

            return res.status(200).json({ success: true, status: 'CORRECTED' });
        }
    } catch (error: any) {
        console.error('Error fetching enrollment request:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
