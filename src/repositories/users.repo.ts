import { PostgresService } from '../services/postgres.service';
import { SupabaseService } from '../services/supabase.service';
import { User } from '../types/entities';



export class UserRepo {

    constructor(
        private db: PostgresService,
        private supabase: typeof SupabaseService
    ) { }

    async get(): Promise<User[]> {
        const result = await this.db.query('SELECT * FROM users');
        return result.rows as User[];
    }

    async getById(id: string): Promise<User> {
        const result = await this.db.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
        if (result.rows.length === 0) {
            return null
        }
        return result.rows[0] as User;
    }

    async create(user: Partial<User & { password: string }>): Promise<User> {
        // Check if user already exists
        const existingUser = await this.getById(user.id);
        if (existingUser) {
            throw new Error('User already exists');
        }
        const { data, error } = await this.supabase.auth.signUp({
            email: user.email,
            password: user.password,
        });

        if (error) {
            throw new Error(error.message);
        }
        const id = data.user.id;
        user.id = id;
        user.created_at = new Date();
        user.updated_at = new Date();
        user.deleted_at = null;
        delete user.password;

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
        return result.rows[0] as User;
    }

    async updateUser(id: string, userData: Partial<User>): Promise<User> {
        // Check if user exists
        const existingUser = await this.getById(id);
        if (!existingUser) {
            throw new Error('User not found');
        }

        // Always update the updated_at timestamp
        userData.updated_at = new Date();

        // Get all field names and values to update
        const fields = Object.keys(userData);
        const values = Object.values(userData);

        // Create set clause for each field: "field1 = $1, field2 = $2, ..."
        const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');

        // Add the id as the last parameter for the WHERE clause
        values.push(id);

        const query = `
            UPDATE users 
            SET ${setClause}
            WHERE id = $${values.length}
            RETURNING *
        `;

        const result = await this.db.query(query, values);
        return result.rows[0] as User;
    }
}
