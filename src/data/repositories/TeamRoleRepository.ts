import { Pool } from 'pg';
import { TeamRole } from '../../domain/types.js';

export class TeamRoleRepository {
    private pool: Pool;

    constructor(connectionString: string) {
        this.pool = new Pool({
            connectionString: connectionString,
            ssl: {
                rejectUnauthorized: false
            }
        });
    }

    async getActiveRoles(): Promise<TeamRole[]> {
        const query = `
            SELECT code, name
            FROM koneksi_autoenroll.team_roles
            WHERE is_active = true
            ORDER BY name ASC;
        `;

        const result = await this.pool.query(query);
        return result.rows.map(row => ({
            code: row.code,
            name: row.name
        }));
    }
}
