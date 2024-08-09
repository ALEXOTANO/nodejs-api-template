import { Response } from 'express';
import { CustomError } from '../errors/CustomError';
import { RequestFirebaseToken, RequestUserData } from '../types/misc';
import { AuthUsecase } from '../usecases/auth.usecase';

export const AuthController = (authUsecase: ReturnType<typeof AuthUsecase>) => {
    const signIn = async (req: RequestUserData, res: Response) => {
        try {
            const signInData = await authUsecase.signInWithId(req.userData.userId);

            res.json(signInData);
        } catch (e) {
            throw new CustomError({
                message: 'AuthController:signIn.',
                error: e,
                httpResponseCode: 400,
                httpResponse: res,
            });
        }
    };

    const generateToken = async (req: RequestFirebaseToken, res: Response) => {
        try {
            const userId = req.body.userId as string;

            if (!userId) throw new Error('UserId is required.');

            const token = await authUsecase.generateToken(userId, 'user');

            res.json(token);
        } catch (e) {
            throw new CustomError({
                message: 'AuthController:generateToken.',
                error: e,
                httpResponseCode: 400,
                httpResponse: res,
            });
        }
    };

    return {
        generateToken,
        signIn,
    };
};
