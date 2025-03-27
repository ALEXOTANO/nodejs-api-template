import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { asyncErrorHandler } from '../errors/asyncErrorHandler';
import { AuthMiddlewares } from '../middlewares/auth.middleware';

export const AuthRouter = (
    authController: AuthController,
    authMiddleware: ReturnType<typeof AuthMiddlewares>
): Router => {
    const router = Router();

    // Route for generating token (login)
    router.post('/v1/login', asyncErrorHandler(authController.generateToken));

    // Route for retrieving user data after authentication
    router.get('/v1/me', authMiddleware.checkToken, asyncErrorHandler(authController.signIn));

    return router;
};
