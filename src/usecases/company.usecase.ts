import { CompanyRepo } from '../repositories/company.repo';
import { Company } from '../types/entities';

export class CompanyUsecase {
    constructor(private companyRepo: CompanyRepo) { }

    async getAll(): Promise<Company[]> {
        return this.companyRepo.getAll();
    }

    async getById(id: string) {
        return this.companyRepo.getById(id);
    }

    async create(company: Partial<Company>) {
        return this.companyRepo.create(company);
    }

    async update(id: string, company: Partial<Company>) {
        return this.companyRepo.update(id, company);
    }

    async delete(id: string) {
        return this.companyRepo.delete(id);
    }
}
