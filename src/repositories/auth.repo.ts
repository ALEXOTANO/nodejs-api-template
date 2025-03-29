import * as jwt from 'jsonwebtoken';
import { logError } from '../errors/error';
import { PostgresService } from '../services/postgres.service';

export class AuthRepo {
    constructor(
        private pg: PostgresService
    ) { }

    generateToken(userId: string, userType: string): Promise<string> {
        const dataToStore = {
            userId,
            userRole: userType,
            iat: Math.floor(Date.now() / 1000) - 1,
            userType,
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
