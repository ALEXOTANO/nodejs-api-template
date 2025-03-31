import { CustomError } from '../errors/CustomError';
import { PostgresService } from '../services/postgres.service';
import { Agent } from '../types/entities';

export class AgentsRepo {
    constructor(
        private db: PostgresService
    ) { }

    async get(): Promise<Agent[]> {
        const result = await this.db.query('SELECT * FROM agents WHERE deleted_at IS NULL');
        return result.rows as Agent[];
    }

    async getById(id: string): Promise<Agent> {
        const result = await this.db.query('SELECT * FROM agents WHERE id = $1 AND deleted_at IS NULL LIMIT 1', [id]);
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0] as Agent;
    }

    async getByCompanyId(companyId: string): Promise<Agent[]> {
        const result = await this.db.query('SELECT * FROM agents WHERE company_id = $1 AND deleted_at IS NULL', [companyId]);
        return result.rows as Agent[];
    }

    async create(agent: Partial<Agent>): Promise<Agent> {
        if (agent.id) {
            throw new Error('Agent ID should not be provided during creation.');
        }

        agent.created_at = new Date();
        agent.updated_at = new Date();
        agent.deleted_at = null;

        const fields = Object.keys(agent);
        const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
        const columns = fields.join(', ');
        const values = Object.values(agent);

        const query = `
            INSERT INTO agents (${columns}) 
            VALUES (${placeholders})
            RETURNING *
        `;

        const result = await this.db.query(query, values);
        return result.rows[0] as Agent;
    }

    async update(id: string, agentData: Partial<Agent>): Promise<Agent> {
        const existingAgent = await this.getById(id);
        if (!existingAgent) {
            throw new CustomError({ message: 'Agent not found.' });
        }

        agentData.updated_at = new Date();

        const fields = Object.keys(agentData);
        const values = Object.values(agentData);

        const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
        values.push(id);

        const query = `
            UPDATE agents 
            SET ${setClause}
            WHERE id = $${values.length} AND deleted_at IS NULL
            RETURNING *
        `;

        const result = await this.db.query(query, values);
        return result.rows[0] as Agent;
    }

    async delete(id: string): Promise<Agent> {
        const existingAgent = await this.getById(id);
        if (!existingAgent) {
            throw new CustomError({ message: 'Agent not found.' });
        }

        const query = `
            UPDATE agents 
            SET deleted_at = $1 
            WHERE id = $2 AND deleted_at IS NULL
            RETURNING *
        `;

        const result = await this.db.query(query, [new Date(), id]);
        return result.rows[0] as Agent;
    }
}
