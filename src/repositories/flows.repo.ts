import { CustomError } from '../errors/CustomError';
import { PostgresService } from '../services/postgres.service';
import { Flow } from '../types/entities';

export class FlowsRepo {
    constructor(
        private db: PostgresService
    ) { }

    async get(): Promise<Flow[]> {
        const result = await this.db.query('SELECT * FROM flows WHERE deleted_at IS NULL');
        return result.rows as Flow[];
    }

    async getById(id: string): Promise<Flow> {
        const result = await this.db.query('SELECT * FROM flows WHERE id = $1 AND deleted_at IS NULL LIMIT 1', [id]);
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0] as Flow;
    }

    async getByPlatformId(platformId: string): Promise<Flow[]> {
        const result = await this.db.query('SELECT * FROM flows WHERE platform_id = $1 AND deleted_at IS NULL', [platformId]);
        return result.rows as Flow[];
    }

    async getByCompanyId(companyId: string): Promise<Flow[]> {
        const result = await this.db.query('SELECT * FROM flows WHERE company_id = $1 AND deleted_at IS NULL', [companyId]);
        return result.rows as Flow[];
    }

    async create(flow: Partial<Flow>): Promise<Flow> {
        if (flow.id) {
            throw new Error('Flow ID should not be provided during creation.');
        }

        flow.created_at = new Date();
        flow.updated_at = new Date();
        flow.deleted_at = null;

        const fields = Object.keys(flow);
        const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
        const columns = fields.join(', ');
        const values = Object.values(flow);

        const query = `
            INSERT INTO flows (${columns}) 
            VALUES (${placeholders})
            RETURNING *
        `;

        const result = await this.db.query(query, values);
        return result.rows[0] as Flow;
    }

    async update(id: string, flowData: Partial<Flow>): Promise<Flow> {
        const existingFlow = await this.getById(id);
        if (!existingFlow) {
            throw new CustomError({ message: 'Flow not found.' });
        }

        flowData.updated_at = new Date();

        const fields = Object.keys(flowData);
        const values = Object.values(flowData);

        const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
        values.push(id);

        const query = `
            UPDATE flows 
            SET ${setClause}
            WHERE id = $${values.length} AND deleted_at IS NULL
            RETURNING *
        `;

        const result = await this.db.query(query, values);
        return result.rows[0] as Flow;
    }

    async delete(id: string): Promise<Flow> {
        const existingFlow = await this.getById(id);
        if (!existingFlow) {
            throw new CustomError({ message: 'Flow not found.' });
        }

        const query = `
            UPDATE flows 
            SET deleted_at = $1 
            WHERE id = $2 AND deleted_at IS NULL
            RETURNING *
        `;

        const result = await this.db.query(query, [new Date(), id]);
        return result.rows[0] as Flow;
    }
}
