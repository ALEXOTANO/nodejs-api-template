import { Request, Response } from 'express';
import { ConversationUsecase } from '../usecases/conversation.usecase';

export class ConversationsController {
    constructor(private conversationUsecase: ConversationUsecase) { }

    getAll = async (req: Request, res: Response) => {
        try {
            const conversations = await this.conversationUsecase.getAll();
            return res.status(200).json(conversations);
        } catch (error) {
            console.error('Error fetching conversations:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    };
}
