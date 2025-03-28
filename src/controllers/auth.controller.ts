import { Response } from 'express';
import { CustomError } from '../errors/CustomError';
import { RequestFirebaseToken, RequestUserData } from '../types/misc';
import { AuthUsecase } from '../usecases/auth.usecase';

export class AuthController {
    constructor(private authUsecase: AuthUsecase) { }

    signIn = async (req: RequestUserData, res: Response) => {
        try {
            const signInData = await this.authUsecase.signInWithId(req.userData.userId);

            res.json(signInData);
        } catch (e) {
            throw new CustomError({
                message: 'AuthController:signIn.',
                error: e,
                httpResponseCode: 400,
                httpResponse: res,
            });
        }
    }

    generateToken = async (req: RequestFirebaseToken, res: Response) => {
        try {
            const userId = req.body.userId as string;

            if (!userId) throw new Error('user_id is required.');

            const token = await this.authUsecase.generateToken(userId, 'user');

            res.json(token);
        } catch (e) {
            throw new CustomError({
                message: 'AuthController:generateToken.',
                error: e,
                httpResponseCode: 400,
                httpResponse: res,
            });
        }
    }
}
