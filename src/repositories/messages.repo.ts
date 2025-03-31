import { CustomError } from '../errors/CustomError';
import { PostgresService } from '../services/postgres.service';
import { Message } from '../types/entities';

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
        if (message.id) {
            throw new Error('Message ID should not be provided during creation.');
        }

        message.created_at = new Date();
        message.updated_at = new Date();
        message.deleted_at = null;

        const fields = Object.keys(message);
        const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
        const columns = fields.join(', ');
        const values = Object.values(message);

        const query = `
            INSERT INTO messages (${columns}) 
            VALUES (${placeholders})
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
}
