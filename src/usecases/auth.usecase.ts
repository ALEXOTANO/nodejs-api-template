import crypto from 'crypto';
import { DateTime } from 'luxon';
import { CustomError } from '../errors/CustomError';
import { AuthRepo } from '../repositories/auth.repo';
import { CompanyRepo } from '../repositories/company.repo';
import { UserRepo } from '../repositories/users.repo';
import { User, UserRole } from '../types/entities';
import { plans } from '../types/misc';
export class AuthUsecase {
    constructor(
        private authRepo: AuthRepo,
        private userRepo: UserRepo,
        private companyRepo: CompanyRepo,

    ) { }

    async loginWithPassword(username: string, password: string) {
        const userId = await this.authRepo.signInSupabaseWithPassword(username, password)

        const user = await this.userRepo.getById(userId);

        if (!user) {
            return {
                user: null,
                token: null,
            }
        }

        const token = await this.authRepo.generateToken(user);

        return {
            user,
            token,
        };
    };
    async signInWithId(userId: string) {
        const user = await this.userRepo.getById(userId);

        if (!user) {
            return {
                user: null,
                token: null,
            }
        }

        const token = await this.authRepo.generateToken(user);

        return {
            user,
            token,
        };
    }

    async createUser(userData: Partial<User & { password: string }>) {

        if (!userData.password) {
            throw new Error('Password is required');
        }

        // check if the user already exists
        const existingUser = await this.userRepo.getById(userData.id);
        if (existingUser) {
            throw new Error('User already exists');
        }

        // check if the user has a company_id and create it if not
        if (!userData.company_id) userData.company_id = crypto.randomUUID();


        const userToCreate = {
            ...userData,
            role: UserRole.user,
            is_active: userData.is_active !== undefined ? userData.is_active : true
        };
        try {

            const new_user = await this.userRepo.create(userToCreate);
            await this.companyRepo.create({
                id: userData.company_id,
                name: '', // empty name for now
                plan: plans.free,
                expires_at: DateTime.now().plus({ days: 30 }).toJSDate(),
            });
            return new_user;

        } catch (e) {
            // Check if the error is a database constraint violation
            if (e instanceof Error && e.message.includes('duplicate key value violates unique constraint')) {
                throw new CustomError({
                    context: 'AuthController:createUser.',
                    messageDetail: 'A user with this email already exists.',
                });
            }

            throw new CustomError({
                context: 'AuthController:createUser.',
                error: e
            });
        }

    }
}

