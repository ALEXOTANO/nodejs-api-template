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

        // Check if company already has an ID
        if (company.id) {
            throw new Error('Company ID should not be provided during creation.');
        }
        company.created_at = new Date();
        company.updated_at = new Date();
        company.deleted_at = null;
        company.id = crypto.randomUUID();

        // check that the company doens't have properties that are not in the Company interface
        const allowedFields = Object.keys(new Company());
        const invalidFields = Object.keys(company).filter(field => !allowedFields.includes(field));
        if (invalidFields.length > 0) {
            throw new Error(`Invalid fields: ${invalidFields.join(', ')}`);
        }



        // Get all field names and values
        const fields = Object.keys(company);
        const values = Object.values(company);

        // Create parameterized query with $1, $2, etc.
        const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
        const columnNames = fields.join(', ');

        // Insert query that returns the created record
        const query = `
             INSERT INTO users (${columnNames}) 
             VALUES (${placeholders})
             RETURNING *
         `;
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
