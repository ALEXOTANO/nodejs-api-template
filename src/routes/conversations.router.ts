import { Router } from 'express';
import { ConversationsController } from '../controllers/conversations.controller';
import { asyncErrorHandler } from '../errors/asyncErrorHandler';

export const ConversationsRouter = (conversationsController: ConversationsController) => {
    const conversations = Router();
    conversations.get('/v1/conversations', [], asyncErrorHandler(conversationsController.getAll));
    return conversations;
};
