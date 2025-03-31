import { ContactRepo } from '../repositories/contacts.repo';
import { ConversationRepo } from '../repositories/conversations.repo';
import { MessageRepo } from '../repositories/messages.repo';
import { Conversation, Message } from '../types/entities';

export class ConversationUsecase {
    constructor(
        private conversationRepo: ConversationRepo,
        private messageRepo: MessageRepo,
        private contactsRepo: ContactRepo
    ) { }


    async getAllWithContacts(companyId: string, searchParams?: any) {

        return this.conversationRepo.getAllWithContacts(companyId);
    }
    async getAll(companyId: string, searchParams?: any) {
        if (!searchParams) {
            searchParams = {};
        }
        searchParams.company_id = companyId;
        return this.conversationRepo.getAll(searchParams);
    }

    async getById(conversationId: string, companyId: string) {
        const conversation = await this.conversationRepo.getById(conversationId, companyId);
        if (!conversation) {
            return null;
        }
        return conversation;


    }
    async getByIdWithMessages(conversationId: string, companyId: string) {
        const conversationPromise = this.conversationRepo.getById(conversationId, companyId);
        const messagesPromise = this.messageRepo.getByConversationId(conversationId);
        const [conversation, messages] = await Promise.all([conversationPromise, messagesPromise]);
        if (!conversation) {
            return null;
        }
        return {
            ...conversation,
            messages: messages
        };

    }

    async create(conversation: Partial<Conversation>) {
        if (!conversation.contact_id) {
            // session is the phone number
            const contact = await this.contactsRepo.getByPhoneNumber(conversation.session_id, conversation.company_id);
            if (contact) {
                conversation.contact_id = contact.id;
            } else {
                const newContact = await this.contactsRepo.create({
                    first_name: '',
                    last_name: '',
                    company_name: '',
                    needs: '',
                    email: '',
                    phone_number: conversation.session_id,
                    address: '',
                    city: '',
                    state: '',
                    notes: '',
                    company_id: conversation.company_id,
                });
                conversation.contact_id = newContact.id;
            }
        }
        return this.conversationRepo.create(conversation);
    }

    async update(id: string, companyId: string, conversation: Partial<Conversation>) {
        return this.conversationRepo.update(id, companyId, conversation);
    }

    async addMessage(message: Partial<Message>) {
        if (message.conversation_id) {
            this.conversationRepo.increaseMessageCount(message.conversation_id);
        }
        return this.messageRepo.create(message);
    }

    async upsert(id: string, companyId: string, conversation: Partial<Conversation>) {
        const existingConversation = await this.getById(id, companyId);

        if (existingConversation) {
            return this.update(id, companyId, conversation);
        } else {
            return this.create({ ...conversation, id });
        }
    }

    async delete(id: string): Promise<boolean> {
        return this.conversationRepo.delete(id);
    }
}
