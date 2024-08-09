import { NextFunction, Request, Response } from 'express';
import { RequestFirebaseToken, RequestUserData } from '../types/misc';
import { CustomError } from './CustomError';

export const asyncErrorHandler =
    (
        callback: (
            req: Request | RequestFirebaseToken | RequestUserData,
            res: Response,
            next?: NextFunction
        ) => Promise<unknown>
    ) =>
    (req: Request, res: Response, next: NextFunction) => {
        callback(req, res, next).catch((e) => {
            if (e?.httpResponse || e instanceof CustomError) {
                return;
            }
            console.log('---- >    ASYNC_ERROR_HANDLER    < ---- ');
            //? Track error else where if needed

            res.status(500).json({ message: 'Unexpected Async Error', error: e?.message || e });
        });
    };
