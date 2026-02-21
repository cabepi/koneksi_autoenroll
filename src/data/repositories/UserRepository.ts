import { query } from '../db.js';
import { User } from '../../domain/types.js';

export class UserRepository {
    async findByEmail(email: string): Promise<User | null> {
        const { rows } = await query('SELECT * FROM asset.users WHERE email = $1', [email]);
        if (rows.length === 0) return null;
        return rows[0] as User;
    }

    async create(user: Omit<User, 'id' | 'createdAt'>, passwordHash: string): Promise<User> {
        const { rows } = await query(
            'INSERT INTO asset.users (email, password_hash, role, name) VALUES ($1, $2, $3, $4) RETURNING id, email, role, name, created_at as "createdAt"',
            [user.email, passwordHash, user.role, user.name]
        );
        return rows[0] as User;
    }
}
