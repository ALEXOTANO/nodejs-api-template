import { Response } from 'express';
import { CustomError } from '../errors/CustomError';
import { User } from '../types/entities';
import { RequestFirebaseToken, RequestUserData } from '../types/misc';
import { AuthUsecase } from '../usecases/auth.usecase';

export class AuthController {
    constructor(private authUsecase: AuthUsecase) { }

    signInWithPassword = async (req: RequestUserData, res: Response) => {
        try {
            // extract userName and password
            const { username, password } = req.body;
            if (!username || !password) {
                throw new Error('Error 1: Either username or password is wrong.');
            }
            // check that the user is either a phone number or an email
            const isPhoneNumber = /^\d+$/.test(username);
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username);
            if (!isPhoneNumber && !isEmail) {
                throw new Error('Error 2: Either username or password is wrong.');
            }
            const signInData = await this.authUsecase.loginWithPassword(username, password);
            if (!signInData) {
                throw new Error('Error 3: Either userName or password is wrong.');
            }

            res.json(signInData);
        } catch (e) {
            throw new CustomError({
                context: 'AuthController:signIn.',
                error: e,
                httpResponseCode: 400,
                httpResponse: res,
            });
        }
    }
    signInWithSupabaseToken = async (req: RequestUserData, res: Response) => {
        try {
            const signInData = await this.authUsecase.signInWithId(req.userData.id);

            res.json(signInData);
        } catch (e) {
            throw new CustomError({
                context: 'AuthController:signIn.',
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
                context: 'AuthController:generateToken.',
                error: e,
                httpResponseCode: 400,
                httpResponse: res,
            });
        }
    }

    createUser = async (req: RequestUserData, res: Response) => {
        try {
            const userData = req.body as Partial<User>;


            if (!userData.email || !userData.name) {
                throw new Error('Email and name are required fields.');
            }

            const newUser = await this.authUsecase.createUser(userData);

            res.status(201).json(newUser);
        } catch (e) {
            throw new CustomError({
                context: 'AuthController:createUser.',
                error: e,
                httpResponseCode: 400,
                httpResponse: res,
            });
        }
    }
}
