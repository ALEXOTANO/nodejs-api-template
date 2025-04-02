import { Router } from 'express';
import { ConversationsController } from '../controllers/conversations.controller';
import { asyncErrorHandler } from '../errors/asyncErrorHandler';
import { AuthMiddlewares } from '../middlewares/auth.middleware';

export const ConversationsRouter = (
    conversationsController: ConversationsController,
    authMiddlewares: ReturnType<typeof AuthMiddlewares>
) => {
    const conversations = Router();
    conversations.get('/v1/conversations',
        [authMiddlewares.checkToken],
        asyncErrorHandler(conversationsController.getAll)
    );
    conversations.get('/v1/conversations/contacts', // Esta ruta esta mal pero ya estaba inchado los huevos
        [authMiddlewares.checkToken],
        asyncErrorHandler(conversationsController.getAllWithContacts)
    );
    conversations.post('/v1/conversations',
        [authMiddlewares.checkToken],
        asyncErrorHandler(conversationsController.create)
    );
    conversations.get('/v1/conversations/:conversationId',
        [authMiddlewares.checkToken],
        asyncErrorHandler(conversationsController.getById)
    );
    conversations.get('/v1/conversations/:conversationId/messages',
        [authMiddlewares.checkToken],
        asyncErrorHandler(conversationsController.getByIdWithMessages)
    );
    conversations.post('/v1/conversations/:conversationId/messages',
        [authMiddlewares.checkToken],
        asyncErrorHandler(conversationsController.addMessage)
    );
    conversations.patch('/v1/conversations/:conversationId/is_active',
        [authMiddlewares.checkToken],
        asyncErrorHandler(conversationsController.setAgentIsActiveOnConversation)
    );
    return conversations;
};
