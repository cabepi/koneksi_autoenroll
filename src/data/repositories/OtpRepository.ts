import { query } from '../db.js';

export interface OtpRecord {
    id: number;
    identifier: string;
    code: string;
    created_at: Date;
    expires_at: Date;
    verified: boolean;
}

export class OtpRepository {
    async createOtp(identifier: string, code: string, expiresAt: Date): Promise<OtpRecord> {
        const queryText = `
            INSERT INTO koneksi_autoenroll.otps (identifier, code, expires_at)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const { rows } = await query(queryText, [identifier, code, expiresAt]);
        return rows[0] as OtpRecord;
    }

    async findValidOtp(identifier: string, code: string): Promise<OtpRecord | null> {
        const queryText = `
            SELECT * FROM koneksi_autoenroll.otps
            WHERE identifier = $1 
              AND code = $2 
              AND verified = false
              AND expires_at > NOW()
            ORDER BY created_at DESC
            LIMIT 1
        `;
        const { rows } = await query(queryText, [identifier, code]);
        if (rows.length === 0) return null;
        return rows[0] as OtpRecord;
    }

    async markAsVerified(id: number): Promise<void> {
        const queryText = `
            UPDATE koneksi_autoenroll.otps
            SET verified = true
            WHERE id = $1
        `;
        await query(queryText, [id]);
    }
}
