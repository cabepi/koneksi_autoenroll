import { Pool } from 'pg';
import { EnrollmentRequestRepository } from '../src/data/repositories/EnrollmentRequestRepository.js';
import { put } from '@vercel/blob';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

const repository = new EnrollmentRequestRepository(pool);

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const body = req.body;

        if (!body || !body.identificationNumber || !body.email) {
            return res.status(400).json({ error: 'Missing required fields (identificationNumber, email)' });
        }

        // 1. Inserción inicial con URL en null
        const id = await repository.create({
            identificationNumber: body.identificationNumber,
            fullName: body.fullName || '',
            medicalLicense: body.medicalLicense || '',
            registrationDate: body.registrationDate || '',
            specialties: body.specialties || [],
            email: body.email,
            emailVerified: body.emailVerified || false,
            phone: body.phone || '',
            biometricImageUrl: null, // Insertando explícitamente null al inicio
            teamMembers: body.teamMembers || [],
            medicalCenters: body.medicalCenters || [],
            arsProviders: body.arsProviders || [],
        });

        // 2. Proceso de subida de imagen si existe y actualización
        if (body.biometricImageBase64) {
            try {
                const base64Data = body.biometricImageBase64.replace(/^data:image\/\w+;base64,/, '');
                const buffer = Buffer.from(base64Data, 'base64');

                // Estructura de carpetas: solicitudes_enrolamiento_medicos/id_de_solicitud/cedula/biometric_scan.jpg
                const path = `solicitudes_enrolamiento_medicos/${id}/${body.identificationNumber}/biometric_scan.jpg`;

                const blob = await put(path, buffer, {
                    access: 'public',
                    contentType: 'image/jpeg',
                    token: process.env.BLOB_READ_WRITE_TOKEN
                });

                // 3. Update the record with the actual URL
                await repository.updateBiometricUrl(id, blob.url);
            } catch (imageError) {
                console.error('Error uploading image or updating URL. DB record exists with null URL.', imageError);
                // Depending on requirements, we might return partial success here
            }
        }

        // 4. Insert initial status history record
        await repository.insertStatusHistory(id, 'PENDING_CONFIRMATION', body.email);

        return res.status(201).json({ id, status: 'PENDING_CONFIRMATION' });
    } catch (error) {
        console.error('Error creating enrollment request:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
