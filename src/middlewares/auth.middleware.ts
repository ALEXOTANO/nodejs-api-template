import 'dotenv/config';
import { NextFunction, Request, Response } from 'express';
import * as JWT from 'jsonwebtoken';
import { CustomError } from '../errors/CustomError';
import { FirebaseService as fb } from '../services/firebase.service';
import { SupabaseService } from '../services/supabase.service';
import { UserData } from '../types/misc';
import { CustomResponse } from '../utils/response.util';



export const AuthMiddlewares = (firebaseService: typeof fb, supabaseService: typeof SupabaseService) => {
    const checkToken = (req: Request, res: Response, next: NextFunction) => {
        try {
            let token = req.headers['authorization'];
            token = token.replace('Bearer ', '');

            if (!token) {
                res.status(401).json(new CustomResponse('No token provided', 'token_required', null));
                return;
            }
            const decodedToken = JWT.verify(token, process.env.JWT_SECRET as string) as UserData;
            if (!decodedToken) {
                res.status(401).json(new CustomResponse('Unauthorize', '', null));
                return;
            }

            req['userData'] = {
                userId: decodedToken['userId'],
                userRole: decodedToken['userRole'],
            };
            next();
        } catch (e) {
            new CustomError({ error: e, context: 'AuthMiddleware:checkToken' });
            res.status(401).json(new CustomResponse('Unauthorize', '', null));
            return;
        }
    };

    const checkSupabaseToken = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const supabaseToken = req.headers['supabasetoken'] as string;
            if (!supabaseToken) {
                res.status(401).json(
                    new CustomResponse('Missing Token: request has to include a header supabasetoken', '', null)
                );
                return;
            }
            const supabaseUser = await supabaseService.auth.getUser(supabaseToken.replace('Bearer ', ''));
            if (!supabaseUser) {
                res.status(401).json(new CustomResponse('Invalid supabasetoken', '', null));
                return;
            }
            req['userData'] = {
                id: supabaseUser.data.user.id,
                email: supabaseUser?.data?.user?.email,
                phone: supabaseUser?.data?.user?.phone,
            };

            next();

        } catch (error) {
            new CustomError({ error, context: 'AuthMiddleware:checkSupabaseToken' });
            res.status(401).json(new CustomResponse('Invalid supabasetoken', '', null));
            return;
        }
    };

    const checkFirebaseToken = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const firebaseToken = req.headers['firebasetoken'] as string;

            if (!firebaseToken) {
                res.status(401).json(
                    new CustomResponse('Missing Token: request has to include a header firebasetoken', '', null)
                );
                return;
            }
            const decodedToken = await firebaseService.appAuth.verifyIdToken(firebaseToken);
            if (!decodedToken) throw new Error('Invalid firebasetoken');

            req['firebaseId'] = decodedToken.uid;

            next();
        } catch (error) {
            new CustomError({ error, context: 'AuthMiddleware:checkFirebaseToken' });
            res.status(401).json(new CustomResponse('Invalid firebasetoken', '', null));
        }
    };

    return {
        checkToken,
        checkFirebaseToken,
        checkSupabaseToken,
    };
};
