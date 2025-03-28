import { ConversationRepo } from '../repositories/conversations.repo';
import { Conversation } from '../types/entities';

export class ConversationUsecase {
    constructor(private conversationRepo: ConversationRepo) { }

    async getAll(): Promise<Conversation[]> {
        return this.conversationRepo.getAll();
    }

    async getById(id: string): Promise<Conversation | null> {
        return this.conversationRepo.getById(id);
    }

    async create(conversation: Omit<Conversation, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<Conversation> {
        return this.conversationRepo.create(conversation);
    }

    async update(id: string, conversation: Partial<Omit<Conversation, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>): Promise<Conversation | null> {
        return this.conversationRepo.update(id, conversation);
    }

    async delete(id: string): Promise<boolean> {
        return this.conversationRepo.delete(id);
    }
}
