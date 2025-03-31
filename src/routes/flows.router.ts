import { Router } from 'express';
import { FlowsController } from '../controllers/flows.controller';
import { asyncErrorHandler } from '../errors/asyncErrorHandler';
import { AuthMiddlewares } from '../middlewares/auth.middleware';

export const FlowsRouter = (
    flowsController: FlowsController,
    authMiddleware: ReturnType<typeof AuthMiddlewares>
): Router => {
    const router = Router();

    // Route for creating a new flow
    router.post('/v1/flows', [authMiddleware.checkToken], asyncErrorHandler(flowsController.createFlow));

    // Route for updating an existing flow
    router.put('/v1/flows/:id', [authMiddleware.checkToken], asyncErrorHandler(flowsController.updateFlow));

    return router;
};
