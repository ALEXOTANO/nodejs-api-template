import crypto from 'crypto';
import { PostgresService } from '../services/postgres.service';
import { Company } from '../types/entities';
export class CompanyRepo {
    constructor(private db: PostgresService) { }

    async getAll(): Promise<Company[]> {
        const query = 'SELECT * FROM companies WHERE deleted_at IS NULL';
        const result = await this.db.query<Company>(query);
        return result.rows;
    }

    async getById(id: string): Promise<Company | null> {
        const query = 'SELECT * FROM companies WHERE id = $1 AND deleted_at IS NULL';
        const result = await this.db.query<Company>(query, [id]);
        return result.rows[0] || null;
    }

    async create(company: Partial<Company>): Promise<Company> {


        company.created_at = new Date();
        company.updated_at = new Date();
        company.deleted_at = null;
        company.id = company.id || crypto.randomUUID();

        // check that the company doens't have properties that are not in the Company interface


        // Get all field names and values
        const query = `
            INSERT INTO companies (id, name, plan, expires_at, created_at, updated_at, deleted_at) 
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const values = [
            company.id,
            company.name,
            company.plan,
            company.expires_at,
            company.created_at,
            company.updated_at,
            company.deleted_at
        ];
        const result = await this.db.query<Company>(query, values);
        return result.rows[0] as Company;
    }

    async update(id: string, company: Partial<Omit<Company, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>): Promise<Company | null> {
        const updates: string[] = [];
        const values: any[] = [];
        let paramCounter = 1;

        Object.keys(company).forEach(key => {
            updates.push(`${key} = $${paramCounter}`);
            values.push(company[key as keyof typeof company]);
            paramCounter++;
        });

        updates.push(`updated_at = NOW()`);

        if (updates.length === 0) return this.getById(id);

        values.push(id);

        const query = `
      UPDATE companies 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCounter} AND deleted_at IS NULL
      RETURNING *
    `;

        const result = await this.db.query<Company>(query, values);
        return result.rows[0] || null;
    }

    async delete(id: string): Promise<boolean> {
        const query = 'UPDATE companies SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL';
        const result = await this.db.query(query, [id]);
        return result.rowCount > 0;
    }
}
