import cors from 'cors';
import { NextFunction, Request, Response } from 'express';

const allowedUrls = ['http://localhost:3000'];

const whitelistedEndpoints = ['/healthcheck/'];

export const corsMiddleware = (originalReq: Request, res: Response, next: NextFunction) =>
    cors({
        origin(origin: string, next: any) {
            if (whitelistedEndpoints.some((endpoint) => originalReq.url.includes(endpoint))) {
                return next(null, true);
            }

            if (!origin) return next(new Error(`The CORS policy needs a origin. ${origin}`), true);
            if (!allowedUrls.includes(origin)) {
                const msg = `The CORS policy for this site does not allow access from the specified origin. ${origin} `;
                return next(new Error(msg), false);
            }
            return next(null, true);
        },
    })(originalReq, res, next);
