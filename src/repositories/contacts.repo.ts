import { PostgresService } from '../services/postgres.service';
import { Contact } from '../types/entities';

export class ContactRepo {
    constructor(private db: PostgresService) { }

    async getAll(companyId: string) {
        const query = 'SELECT * FROM contacts WHERE deleted_at IS NULL AND company_id = $1';
        const params = [companyId];
        const result = await this.db.query<Contact>(query, params);
        return result.rows;
    }

    async getByPhoneNumber(phoneNumber: string, companyId: string) {
        const query = 'SELECT * FROM contacts WHERE phone_number = $1 AND company_id = $2 AND deleted_at IS NULL';
        const result = await this.db.query<Contact>(query, [phoneNumber, companyId]);
        return result.rows[0] || null;
    }

    async getById(id: string, companyId: string) {
        const query = 'SELECT * FROM contacts WHERE id = $1 AND company_id = $2 AND deleted_at IS NULL';
        const result = await this.db.query<Contact>(query, [id, companyId]);
        return result.rows[0] || null;
    }

    async create(contact: Omit<Contact, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<Contact> {
        const query = `
      INSERT INTO contacts (
        first_name, last_name, company_name, needs, email, 
        phone_number, address, city, state, notes, company_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
        const result = await this.db.query<Contact>(query, [
            contact.first_name,
            contact.last_name,
            contact.company_name,
            contact.needs,
            contact.email,
            contact.phone_number,
            contact.address,
            contact.city,
            contact.state,
            contact.notes,
            contact.company_id
        ]);
        return result.rows[0];
    }

    async update(id: string, contact: Partial<Contact>) {
        const updates: string[] = [];
        const values: any[] = [];
        let paramCounter = 1;

        Object.keys(contact).forEach(key => {
            updates.push(`${key} = $${paramCounter}`);
            values.push(contact[key as keyof typeof contact]);
            paramCounter++;
        });

        updates.push(`updated_at = NOW()`);

        if (updates.length === 0) return this.getById(id, contact.company_id);

        values.push(id);

        const query = `
      UPDATE contacts 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCounter} AND deleted_at IS NULL
      RETURNING *
    `;

        const result = await this.db.query<Contact>(query, values);
        return result.rows[0] || null;
    }

    async delete(id: string): Promise<boolean> {
        const query = 'UPDATE contacts SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL';
        const result = await this.db.query(query, [id]);
        return result.rowCount > 0;
    }
}
