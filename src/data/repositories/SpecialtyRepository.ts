import { query } from '../db.js';
import { MedicalSpecialty } from '../../domain/types.js';

export class SpecialtyRepository {
    async searchByFallbackName(searchTerm: string): Promise<MedicalSpecialty[]> {
        const queryText = `
            SELECT slug, fallback_name 
            FROM koneksi_autoenroll.medical_specialties 
            WHERE fallback_name ILIKE $1 AND enabled = true 
            LIMIT 20
        `;
        // ILIKE with wildcards for partial match
        const { rows } = await query(queryText, [`%${searchTerm}%`]);
        return rows as MedicalSpecialty[];
    }
}
