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

    async update(id: string, payload: EnrollmentPayload): Promise<void> {
        const client = await this.pool.connect();
        try {
            await client.query(
                `UPDATE koneksi_autoenroll.doctor_enrollment_requests 
                 SET full_name = $1, 
                     medical_license = $2, 
                     registration_date = $3, 
                     specialties = $4, 
                     email = $5, 
                     email_verified = $6, 
                     phone = $7, 
                     team_members = $8, 
                     medical_centers = $9, 
                     ars_providers = $10,
                     status = 'CORRECTED',
                     evaluation_reason_id = NULL,
                     evaluation_notes = NULL
                 WHERE id = $11`,
                [
                    payload.fullName,
                    payload.medicalLicense,
                    payload.registrationDate,
                    JSON.stringify(payload.specialties),
                    payload.email,
                    payload.emailVerified,
                    payload.phone,
                    JSON.stringify(payload.teamMembers),
                    JSON.stringify(payload.medicalCenters),
                    JSON.stringify(payload.arsProviders),
                    id
                ]
            );
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

    async getEnrollmentRequestById(id: string): Promise<any | null> {
        const client = await this.pool.connect();
        try {
            // Fetch the main request details along with its latest status from the history table
            const query = `
                SELECT 
                    r.id,
                    r.identification_number,
                    r.full_name,
                    r.medical_license,
                    r.registration_date,
                    r.biometric_image_url,
                    r.email,
                    r.phone,
                    r.specialties,
                    r.team_members,
                    r.medical_centers,
                    r.ars_providers,
                    r.created_at,
                    r.evaluation_notes,
                    er.description as evaluation_reason_description,
                    (
                        SELECT status 
                        FROM koneksi_autoenroll.enrollment_request_status_history h 
                        WHERE h.request_id = r.id 
                        ORDER BY changed_at DESC 
                        LIMIT 1
                    ) as current_status
                FROM koneksi_autoenroll.doctor_enrollment_requests r
                LEFT JOIN koneksi_autoenroll.evaluation_reasons er ON er.id = r.evaluation_reason_id
                WHERE r.id = $1
            `;
            const result = await client.query(query, [id]);
            return result.rows.length > 0 ? result.rows[0] : null;
        } finally {
            client.release();
        }
    }
}
