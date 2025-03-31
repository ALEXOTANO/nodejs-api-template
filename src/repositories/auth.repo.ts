import * as jwt from 'jsonwebtoken';
import { logError } from '../errors/error';
import { PostgresService } from '../services/postgres.service';
import { SupabaseService } from '../services/supabase.service';
import { User } from '../types/entities';

export class AuthRepo {
    constructor(
        private pg: PostgresService,
        private supabase: typeof SupabaseService
    ) { }

    signInSupabaseWithPassword = async (username: string, password: string) => {
        // Check if username is a phone number or email
        const isPhoneNumber = /^\d+$/.test(username);
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username);
        const credentials = {
            email: username,
            password,
        }
        if (isPhoneNumber) {
            delete credentials.email;
            credentials['phone'] = username;
        }

        const { data, error } = await this.supabase.auth.signInWithPassword(
            credentials
        );
        if (error) {
            throw new Error(error.message);
        }
        return data.user.id;

    }

    generateToken(user: User): Promise<string> {
        const dataToStore = {
            userId: user.id,
            userRole: user.role,
            companyId: user.company_id,
            iat: Math.floor(Date.now() / 1000) - 1,
        };

        return new Promise((res, rej) => {
            jwt.sign(dataToStore, process.env.JWT_SECRET, { expiresIn: 60 * 60 * 24 * 30 }, (err, token) => {
                if (err) rej(err);
                res(token);
            });
        });
    }

    async getByFirebaseId(userId: string): Promise<any> {
        try {
            const query = 'SELECT * FROM users WHERE user_id = $1';
            const params = [userId];
            const result = await this.pg.query(query, params);

            if (!result || result.rows.length === 0) {
                throw new Error('User not found');
            }

            return result.rows[0];
        } catch (error) {
            logError(error);
            throw error;
        }
    }
}
