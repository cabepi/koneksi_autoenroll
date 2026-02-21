import { Pool } from 'pg';
import { EnrollmentRequestRepository } from '../src/data/repositories/EnrollmentRequestRepository.js';

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

        const id = await repository.create({
            identificationNumber: body.identificationNumber,
            fullName: body.fullName || '',
            medicalLicense: body.medicalLicense || '',
            registrationDate: body.registrationDate || '',
            specialties: body.specialties || [],
            email: body.email,
            emailVerified: body.emailVerified || false,
            phone: body.phone || '',
            biometricImage: body.biometricImage || null,
            teamMembers: body.teamMembers || [],
            medicalCenters: body.medicalCenters || [],
            arsProviders: body.arsProviders || [],
        });

        return res.status(201).json({ id, status: 'PENDING_CONFIRMATION' });
    } catch (error) {
        console.error('Error creating enrollment request:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
