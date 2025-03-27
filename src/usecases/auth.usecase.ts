import { AuthRepo } from '../repositories/auth.repo';
import { UserRepo } from '../repositories/users.repo';

export class AuthUsecase {
    constructor(
        private authRepo: AuthRepo,
        private userRepo: UserRepo
    ) { }

    async signInWithId(userId: string) {
        const user = await this.userRepo.getById(userId);

        if (!user) throw new Error('User not found.');

        const token = await this.authRepo.generateToken(user.id, user.userType);

        return {
            user,
            token,
        };
    }

    async generateToken(userId: string, userType: string) {
        return this.authRepo.generateToken(userId, userType);
    }
}
