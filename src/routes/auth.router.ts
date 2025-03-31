import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { asyncErrorHandler } from '../errors/asyncErrorHandler';
import { AuthMiddlewares } from '../middlewares/auth.middleware';

export const AuthRouter = (
    authController: AuthController,
    authMiddleware: ReturnType<typeof AuthMiddlewares>
): Router => {
    const router = Router();

    // Sign in using password and user (email or phone number)
    router.post('/v1/signin', [], asyncErrorHandler(authController.signInWithPassword));

    // signin with supabase token
    router.post('/v1/login', [authMiddleware.checkSupabaseToken], asyncErrorHandler(authController.signInWithSupabaseToken));

    // Route for creating new users
    router.post('/v1/users', asyncErrorHandler(authController.createUser));

    return router;
};
