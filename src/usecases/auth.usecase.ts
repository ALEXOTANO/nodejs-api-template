import { DateTime } from 'luxon';
import { AuthRepo } from '../repositories/auth.repo';
import { CompanyRepo } from '../repositories/companies.repo';
import { UserRepo } from '../repositories/users.repo';
import { User, UserRole } from '../types/entities';
import { plans } from '../types/misc';

export class AuthUsecase {
    constructor(
        private authRepo: AuthRepo,
        private userRepo: UserRepo,
        private companyRepo: CompanyRepo,

    ) { }

    async signInWithId(userId: string) {
        const user = await this.userRepo.getById(userId);

        if (!user) {
            return {
                user: null,
                token: null,
            }
        }

        const token = await this.authRepo.generateToken(user.id, UserRole.user);

        return {
            user,
            token,
        };
    }

    async generateToken(userId: string, userType: string) {
        return this.authRepo.generateToken(userId, userType);
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
        if (!userData.company_id) {
            const company = await this.companyRepo.create({
                name: '', // empty name for now
                plan: plans.free,
                expires_at: DateTime.now().plus({ days: 30 }).toJSDate(),
            });
            userData.company_id = company.id;
        }



        const userToCreate = {
            ...userData,
            isActive: userData.isActive !== undefined ? userData.isActive : true
        };

        return this.userRepo.create(userToCreate);
    }
}
