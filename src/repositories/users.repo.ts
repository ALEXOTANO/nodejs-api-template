import { PostgresService } from '../services/postgres.service';
import { User } from '../types/autogen/types';

export class UserRepo {
    private db: PostgresService;

    constructor(db: PostgresService) {
        this.db = db;
    }

    async get(): Promise<User[]> {
        const result = await this.db.query('SELECT * FROM users');
        return result.rows;
    }

    async getById(id: string): Promise<User> {
        const result = await this.db.query('SELECT * FROM users WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            throw new Error('User not found');
        }
        return result.rows[0];
    }

    async create(user: Partial<User>): Promise<User> {
        // Get all field names and values
        const fields = Object.keys(user);
        const values = Object.values(user);

        // Create parameterized query with $1, $2, etc.
        const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
        const columnNames = fields.join(', ');

        // Insert query that returns the created record
        const query = `
            INSERT INTO users (${columnNames}) 
            VALUES (${placeholders})
            RETURNING *
        `;

        const result = await this.db.query(query, values);
        return result.rows[0];
    }
}
