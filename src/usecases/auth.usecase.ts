import { AuthRepo } from '../repositories/auth.repo';
import { UserRepo } from '../repositories/users.repo';

export const AuthUsecase = (authRepo: ReturnType<typeof AuthRepo>, userRepo: ReturnType<typeof UserRepo>) => {
    const signInWithId = async (userId: string) => {
        const user = await userRepo.getById(userId);

        if (!user) throw new Error('User not found.');

        const token = await authRepo.generateToken(user.id, user.userType);

        return {
            user,
            token,
        };
    };

    const generateToken = async (userId: string, userType: string): Promise<string> => {
        return authRepo.generateToken(userId, userType);
    };

    return {
        generateToken,
        signInWithId,
    };
};
