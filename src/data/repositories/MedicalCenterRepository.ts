import { Pool } from 'pg';
import { MedicalCenter } from '../../domain/types.js';

export class MedicalCenterRepository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async searchCenters(query: string, limit: number = 10): Promise<MedicalCenter[]> {
        const client = await this.pool.connect();
        try {
            // ILIKE performs a case-insensitive search
            const result = await client.query(
                `SELECT id, province, name, address, phone, city, sector, "uuid"
                 FROM koneksi_autoenroll.medical_centers 
                 WHERE name ILIKE $1 OR address ILIKE $1
                 ORDER BY name ASC 
                 LIMIT $2`,
                [`%${query}%`, limit]
            );
            return result.rows;
        } finally {
            client.release();
        }
    }
}
