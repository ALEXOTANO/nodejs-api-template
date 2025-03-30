import { CompanyRepo } from '../repositories/company.repo';
import { Company } from '../types/entities';

export class CompanyUsecase {
    constructor(private companyRepo: CompanyRepo) { }

    async getAll(): Promise<Company[]> {
        return this.companyRepo.getAll();
    }

    async getById(id: string): Promise<Company | null> {
        return this.companyRepo.getById(id);
    }

    async create(company: Omit<Company, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<Company> {
        return this.companyRepo.create(company);
    }

    async update(id: string, company: Partial<Omit<Company, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>>): Promise<Company | null> {
        return this.companyRepo.update(id, company);
    }

    async delete(id: string): Promise<boolean> {
        return this.companyRepo.delete(id);
    }
}
