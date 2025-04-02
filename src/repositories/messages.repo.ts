import { CustomError } from '../errors/CustomError';
import { PostgresService } from '../services/postgres.service';
import { Message, MessageSenderType } from '../types/entities';

export class MessageRepo {
    constructor(
        private db: PostgresService
    ) { }

    async get(): Promise<Message[]> {
        const result = await this.db.query('SELECT * FROM messages WHERE deleted_at IS NULL');
        return result.rows as Message[];
    }

    async getById(id: string): Promise<Message> {
        const result = await this.db.query('SELECT * FROM messages WHERE id = $1 AND deleted_at IS NULL LIMIT 1', [id]);
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0] as Message;
    }

    async getByConversationId(conversationId: string): Promise<Message[]> {
        const result = await this.db.query('SELECT * FROM messages WHERE conversation_id = $1 AND deleted_at IS NULL ORDER BY created_at ASC', [conversationId]);
        return result.rows as Message[];
    }

    async getByCompanyId(companyId: string): Promise<Message[]> {
        const result = await this.db.query('SELECT * FROM messages WHERE company_id = $1 AND deleted_at IS NULL', [companyId]);
        return result.rows as Message[];
    }


    async create(message: Partial<Message>): Promise<Message> {
        message.updated_at = new Date();

        if (!message.id) {
            // Only set created_at and deleted_at for new records
            message.id = crypto.randomUUID();
            message.created_at = new Date();
            message.deleted_at = null;
        }

        const fields = Object.keys(message);
        const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
        const columns = fields.join(', ');
        const values = Object.values(message);

        // For update, we only want to update text, updated_at, and error_message
        const updateClause = `
            text = EXCLUDED.text,
            updated_at = EXCLUDED.updated_at,
            error_message = EXCLUDED.error_message
        `;

        const query = `
            INSERT INTO messages (${columns}) 
            VALUES (${placeholders})
            ON CONFLICT (id) 
            DO UPDATE SET ${updateClause}
            WHERE messages.deleted_at IS NULL
            RETURNING *
        `;

        const result = await this.db.query(query, values);
        return result.rows[0] as Message;
    }

    async update(id: string, messageData: Partial<Message>): Promise<Message> {
        const existingMessage = await this.getById(id);
        if (!existingMessage) {
            throw new CustomError({ message: 'Message not found.' });
        }

        messageData.updated_at = new Date();

        const fields = Object.keys(messageData);
        const values = Object.values(messageData);

        const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
        values.push(id);

        const query = `
            UPDATE messages 
            SET ${setClause}
            WHERE id = $${values.length} AND deleted_at IS NULL
            RETURNING *
        `;

        const result = await this.db.query(query, values);
        return result.rows[0] as Message;
    }

    async delete(id: string): Promise<Message> {
        const existingMessage = await this.getById(id);
        if (!existingMessage) {
            throw new CustomError({ message: 'Message not found.' });
        }

        const query = `
            UPDATE messages 
            SET deleted_at = $1 
            WHERE id = $2 AND deleted_at IS NULL
            RETURNING *
        `;

        const result = await this.db.query(query, [new Date(), id]);
        return result.rows[0] as Message;
    }

    async syncMessagesToChatHistory(messages: Message[], session_id: string): Promise<void> {
        // Get existing messages from chat_history
        const existingHistoryResult = await this.db.query(
            'UPDATE chat_history SET candidate_to_delete_id = $1 WHERE session_id = $1 RETURNING *',
            [session_id]
        );

        // Sort messages by creation date
        const sortedMessages = [...messages].sort((a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        for (const message of sortedMessages) {
            // Map sender type to message history type
            const messageType = this.mapSenderTypeToHistoryType(message.sender);

            // Create message history object
            const historyEntry = {
                session_id,
                message: {
                    type: messageType,
                    content: message.text,
                    additional_kwargs: {},
                    response_metadata: {}
                }
            };

            // Insert new message into chat_history
            await this.db.query(
                `INSERT INTO chat_history (session_id, message) VALUES ($1, $2)`,
                [session_id, JSON.stringify(historyEntry.message)]
            );

        }

        // delete candidate messages
        const deleteQuery = `DELETE FROM chat_history WHERE candidate_to_delete_id = $1`;
        await this.db.query(deleteQuery, [session_id]);

    }

    private mapSenderTypeToHistoryType(sender: MessageSenderType): "human" | "ai" {
        if (sender === 'customer') {
            return "human";
        }
        // Both 'human' or 'ai' are mapped to "ai" in chat history - 
        // human for the system is the person talking directly using the app
        return "ai";
    }
}
