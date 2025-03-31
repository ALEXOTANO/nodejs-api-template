import { Router } from 'express';
import { AgentsController } from '../controllers/agents.controller';
import { asyncErrorHandler } from '../errors/asyncErrorHandler';
import { AuthMiddlewares } from '../middlewares/auth.middleware';

export const AgentsRouter = (
    agentsController: AgentsController,
    authMiddleware: ReturnType<typeof AuthMiddlewares>
): Router => {
    const router = Router();

    // Route for creating a new agent
    router.post('/v1/agents', [authMiddleware.checkToken], asyncErrorHandler(agentsController.createAgent));

    // Route for updating an existing agent
    router.put('/v1/agents/:id', [authMiddleware.checkToken], asyncErrorHandler(agentsController.updateAgent));

    return router;
};
