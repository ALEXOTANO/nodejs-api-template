import crypto from 'crypto';
import { PostgresService } from '../services/postgres.service';
import { Conversation } from '../types/entities';
export class ConversationRepo {
    constructor(private db: PostgresService) { }
    increaseMessageCount(id: string) {
        const query = 'UPDATE conversations SET message_count = message_count + 1 WHERE id = $1 AND deleted_at IS NULL RETURNING *';
        return this.db.query<Conversation>(query, [id]);
    }
    async getAllWithContacts(company_id: any) {
        // convert searchParams to SQL query

        const query = `SELECT * FROM conversations AS C INNER JOIN contacts AS CT ON C.contact_id = CT.id WHERE C.deleted_at IS NULL AND C.company_id = $1`;
        const result = await this.db.query<Conversation>(query, [company_id]);
        return result.rows;
    }
    async getAll(searchParams?: any) {
        // convert searchParams to SQL query
        const searchQuery = Object.keys(searchParams).map((key, index) => {
            return `${key} = $${index + 1}`;
        }
        ).join(' AND ');
        const values = Object.values(searchParams);

        const query = `SELECT * FROM conversations WHERE deleted_at IS NULL AND ${searchQuery}`;
        const result = await this.db.query<Conversation>(query, values);
        return result.rows;
    }

    async getById(id: string, companyId: string) {
        const query = 'SELECT * FROM conversations WHERE id = $1 AND deleted_at IS NULL AND company_id = $2 LIMIT 1';
        const values = [id, companyId];
        const result = await this.db.query<Conversation>(query, values);

        return result.rows[0] || null;
    }

    async create(conversation: Partial<Conversation>) {
        // Get all field names and values
        const query = `
      INSERT INTO conversations (id, session_id, contact_id, flow_id, agent_id, is_active, company_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
        const result = await this.db.query<Conversation>(query, [
            crypto.randomUUID(),
            conversation.session_id,
            conversation.contact_id || null,
            conversation.flow_id || null,
            conversation.agent_id || null,
            conversation.is_active || true,
            conversation.company_id || null,
        ]);
        return result.rows[0];
    }

    async update(id: string, companyId: string, conversation: Partial<Omit<Conversation, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>) {
        const updates: string[] = [];
        const values: any[] = [];
        let paramCounter = 1;

        Object.keys(conversation).forEach(key => {
            updates.push(`${key} = $${paramCounter}`);
            values.push(conversation[key as keyof typeof conversation]);
            paramCounter++;
        });

        updates.push(`updated_at = NOW()`);

        if (updates.length === 0) return this.getById(id, companyId);

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
