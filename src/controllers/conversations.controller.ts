import { Response } from 'express';
import { CustomError } from '../errors/CustomError';
import { Message } from '../types/entities';
import { RequestUserData } from '../types/misc';
import { ConversationUsecase } from '../usecases/conversation.usecase';

export class ConversationsController {
    constructor(private conversationUsecase: ConversationUsecase) { }
    getAllWithContacts = async (req: RequestUserData, res: Response) => {
        try {
            const { companyId } = req.userData;



            const conversations = await this.conversationUsecase.getAllWithContacts(companyId);
            return res.status(200).json(conversations);
        } catch (e) {
            throw new CustomError({
                context: 'ConversationsController:getAllWithContacts.',
                error: e,
                httpResponseCode: 400,
                httpResponse: res,
            });
        }
    }
    getAll = async (req: RequestUserData, res: Response) => {
        try {
            const { companyId } = req.userData;
            // extract search params from query
            const searchParams = req.query;


            const conversations = await this.conversationUsecase.getAll(companyId, searchParams);
            return res.status(200).json(conversations);
        } catch (e) {
            throw new CustomError({
                context: 'ConversationsController:getAll.',
                error: e,
                httpResponseCode: 400,
                httpResponse: res,
            });
        }
    };
    create = async (req: RequestUserData, res: Response) => {
        try {
            const { companyId } = req.userData;
            const { session_id, contact_id, flow_id, agent_id } = req.body;

            if (!session_id) {
                return res.status(400).json({ error: 'Session ID is required' });
            }
            if (!companyId) {
                return res.status(400).json({ error: 'Company ID is required' });
            }

            const conversation = await this.conversationUsecase.create({
                session_id,
                contact_id,
                flow_id,
                agent_id,
                company_id: companyId,
            });

            return res.status(201).json(conversation);
        } catch (e) {
            throw new CustomError({
                context: 'ConversationsController:getOrCreate.',
                error: e,
                httpResponseCode: 400,
                httpResponse: res,
            });
        }
    }
    getById = async (req: RequestUserData, res: Response) => {
        try {
            const { conversationId } = req.params;
            const { companyId } = req.userData;

            if (!conversationId) {
                return res.status(400).json({ error: 'Conversation ID is required' });
            }

            const conversation = await this.conversationUsecase.getById(conversationId, companyId);

            return res.status(200).json(conversation);
        } catch (e) {
            throw new CustomError({
                context: 'ConversationsController:getById.',
                error: e,
                httpResponseCode: 400,
                httpResponse: res,
            });
        }
    };
    getByIdWithMessages = async (req: RequestUserData, res: Response) => {
        try {
            const { conversationId } = req.params;
            const { companyId } = req.userData;

            if (!conversationId) {
                return res.status(400).json({ error: 'Conversation ID is required' });
            }

            const conversation = await this.conversationUsecase.getByIdWithMessages(conversationId, companyId);

            return res.status(200).json(conversation);
        } catch (e) {
            throw new CustomError({
                context: 'ConversationsController:getById.',
                error: e,
                httpResponseCode: 400,
                httpResponse: res,
            });
        }
    };

    setAgentIsActiveOnConversation = async (req: RequestUserData, res: Response) => {
        try {
            const { conversationId } = req.params;
            const { companyId } = req.userData;
            const { is_active } = req.body;
            if (!conversationId) {
                return res.status(400).json({ error: 'Conversation ID is required' });
            }
            if (!companyId) {
                return res.status(400).json({ error: 'Company ID is required' });
            }
            if (is_active === undefined) {
                return res.status(400).json({ error: 'is_active is required' });
            }
            const conversation = await this.conversationUsecase.setAgentIsActiveOnConversation(conversationId, companyId, is_active);

            return res.status(200).json(conversation);
        } catch (e) {
            throw new CustomError({
                context: 'ConversationsController:setAgentIsActiveOnConversation.',
                error: e,
                httpResponseCode: 400,
                httpResponse: res,
            });
        }
    }

    addMessage = async (req: RequestUserData, res: Response) => {
        const { conversationId } = req.params;
        const { companyId } = req.userData;
        const { type = 'text', text, sender, error_message, id } = req.body as Message;
        try {
            if (!conversationId) {
                return res.status(400).json({ error: 'Conversation ID is required' });
            }
            if (!companyId) {
                return res.status(400).json({ error: 'Company ID is required' });
            }
            if (!sender) {
                return res.status(400).json({ error: 'Sender is required' });
            }


            // This is to merge the model from n8n or the one from the API
            const messageData = {
                id: id,
                conversation_id: conversationId,
                company_id: companyId,
                type,
                text,
                sender,
                error_message
            };

            const newMessage = await this.conversationUsecase.addMessage(messageData);
            return res.status(201).json(newMessage);
        }
        catch (e) {
            throw new CustomError({
                context: 'ConversationsController:addMessage.',
                error: e,
                httpResponseCode: 400,
                httpResponse: res,
            });
        }
    }
}
