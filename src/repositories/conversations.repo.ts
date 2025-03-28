import { PostgresService } from '../services/postgres.service';
import { Conversation } from '../types/entities';

export class ConversationRepo {
    constructor(private db: PostgresService) { }

    async getAll(): Promise<Conversation[]> {
        const query = 'SELECT * FROM conversations WHERE deleted_at IS NULL';
        const result = await this.db.query<Conversation>(query);
        return result.rows;
    }

    async getById(id: string): Promise<Conversation | null> {
        const query = 'SELECT * FROM conversations WHERE id = $1 AND deleted_at IS NULL';
        const result = await this.db.query<Conversation>(query, [id]);
        return result.rows[0] || null;
    }

    async create(conversation: Omit<Conversation, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<Conversation> {
        const query = `
      INSERT INTO conversations (session_id, message, contact_id, company_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
        const result = await this.db.query<Conversation>(query, [
            conversation.session_id,
            conversation.message,
            conversation.contact_id,
            conversation.company_id
        ]);
        return result.rows[0];
    }

    async update(id: string, conversation: Partial<Omit<Conversation, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>): Promise<Conversation | null> {
        const updates: string[] = [];
        const values: any[] = [];
        let paramCounter = 1;

        Object.keys(conversation).forEach(key => {
            updates.push(`${key} = $${paramCounter}`);
            values.push(conversation[key as keyof typeof conversation]);
            paramCounter++;
        });

        updates.push(`updated_at = NOW()`);

        if (updates.length === 0) return this.getById(id);

        values.push(id);

        const query = `
      UPDATE conversations 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCounter} AND deleted_at IS NULL
      RETURNING *
    `;

        const result = await this.db.query<Conversation>(query, values);
        return result.rows[0] || null;
    }

    async delete(id: string): Promise<boolean> {
        const query = 'UPDATE conversations SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL';
        const result = await this.db.query(query, [id]);
        return result.rowCount > 0;
    }
}
