import { TeamRoleRepository } from '../src/data/repositories/TeamRoleRepository.js';

export default async function handler(req: any, res: any) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            console.error('DATABASE_URL is not set');
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        const repository = new TeamRoleRepository(dbUrl);
        const activeRoles = await repository.getActiveRoles();

        return res.status(200).json(activeRoles);
    } catch (error) {
        console.error('Error fetching team roles:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
