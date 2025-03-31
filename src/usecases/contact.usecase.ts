import { ContactRepo } from '../repositories/contacts.repo';
import { Contact } from '../types/entities';

export class ContactUsecase {
    constructor(private contactRepo: ContactRepo) { }

    async getAll(companyId: string): Promise<Contact[]> {
        return this.contactRepo.getAll(companyId);
    }

    async getById(id: string, companyId: string): Promise<Contact | null> {
        return this.contactRepo.getById(id, companyId);
    }

    async create(contact: Omit<Contact, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<Contact> {
        return this.contactRepo.create(contact);
    }

    async update(id: string, contact: Partial<Omit<Contact, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>): Promise<Contact | null> {
        return this.contactRepo.update(id, contact);
    }

    async delete(id: string): Promise<boolean> {
        return this.contactRepo.delete(id);
    }
}
