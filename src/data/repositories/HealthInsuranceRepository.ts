import { Pool } from 'pg';
import { HealthInsurance } from '../../domain/types.js';

export class HealthInsuranceRepository {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async getActiveHealthInsurances(): Promise<HealthInsurance[]> {
        const client = await this.pool.connect();
        try {
            const query = `
                SELECT code, name 
                FROM koneksi_autoenroll.health_insurances 
                WHERE is_active = true 
                ORDER BY name ASC;
            `;
            const result = await client.query(query);
            return result.rows;
        } finally {
            client.release();
        }
    }
}
