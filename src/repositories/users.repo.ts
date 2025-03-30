import { CustomError } from '../errors/CustomError';
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
        if (user.id) {
            throw new Error('User ID should not be provided during creation.');
        }
        let startTime = Date.now();
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email: user.email,
            password: user.password,
        });
        console.log('supabase data', data);

        if (data.user) {
            user.id = data.user.id;

        } else {
            const { data, error } = await this.supabase.auth.admin.createUser({
                email: user.email,
                password: user.password,
                email_confirm: true,
            });
            console.log('supabase data2', data);

            if (error) {
                throw new Error(error.message);
            }
            user.id = data.user.id;
        }


        let endTime = Date.now();
        console.log(`Supabase signUp took ${endTime - startTime}ms`);



        user.created_at = new Date();
        user.updated_at = new Date();
        user.deleted_at = null;

        // Get all field names and values


        // Explicitly write the query
        const query = `
            INSERT INTO users (id, email, name, company_id, role, created_at, updated_at, deleted_at) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        const values = [
            user.id,
            user.email,
            user.name,
            user.company_id,
            user.role,
            user.created_at,
            user.updated_at,
            user.deleted_at
        ];
        startTime = Date.now();
        const result = await this.db.query(query, values);
        endTime = Date.now();
        console.log(`query took :  ${endTime - startTime}ms`);
        return result.rows[0] as User;
    }

    async updateUser(id: string, userData: Partial<User>): Promise<User> {
        // Check if user exists
        const existingUser = await this.getById(id);
        if (!existingUser) {
            throw new CustomError({ message: 'User not found.' });
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
