import { Pool } from 'pg';

export interface EnrollmentPayload {
    identificationNumber: string;
    fullName: string;
    medicalLicense: string;
    registrationDate: string;
    specialties: any[];
    email: string;
    emailVerified: boolean;
    phone: string;
    biometricImageUrl: string | null;
    teamMembers: any[];
    medicalCenters: any[];
    arsProviders: any[];
}

export class EnrollmentRequestRepository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async create(payload: EnrollmentPayload): Promise<string> {
        const client = await this.pool.connect();
        try {
            const result = await client.query(
                `INSERT INTO koneksi_autoenroll.doctor_enrollment_requests 
                (identification_number, full_name, medical_license, registration_date, specialties, email, email_verified, phone, biometric_image_url, team_members, medical_centers, ars_providers)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                RETURNING id`,
                [
                    payload.identificationNumber,
                    payload.fullName,
                    payload.medicalLicense,
                    payload.registrationDate,
                    JSON.stringify(payload.specialties),
                    payload.email,
                    payload.emailVerified,
                    payload.phone,
                    payload.biometricImageUrl,
                    JSON.stringify(payload.teamMembers),
                    JSON.stringify(payload.medicalCenters),
                    JSON.stringify(payload.arsProviders),
                ]
            );
            return result.rows[0].id;
        } finally {
            client.release();
        }
    }

    async updateBiometricUrl(id: string, url: string): Promise<void> {
        const client = await this.pool.connect();
        try {
            await client.query(
                `UPDATE koneksi_autoenroll.doctor_enrollment_requests 
                 SET biometric_image_url = $1 
                 WHERE id = $2`,
                [url, id]
            );
        } finally {
            client.release();
        }
    }

    async insertStatusHistory(requestId: string, status: string, changedByEmail: string): Promise<void> {
        const client = await this.pool.connect();
        try {
            await client.query(
                `INSERT INTO koneksi_autoenroll.enrollment_request_status_history (request_id, status, changed_by_email)
                 VALUES ($1, $2, $3)`,
                [requestId, status, changedByEmail]
            );
        } finally {
            client.release();
        }
    }
}
