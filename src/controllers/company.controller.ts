import { Request, Response } from 'express';
import { CustomError } from '../errors/CustomError';
import { Company } from '../types/entities';
import { CompanyUsecase } from '../usecases/company.usecase';

export class CompanyController {
    constructor(private companyUsecase: CompanyUsecase) { }

    getAllCompanies = async (req: Request, res: Response) => {
        try {
            const companies = await this.companyUsecase.getAll();
            res.json(companies);
        } catch (e) {
            throw new CustomError({
                context: 'CompanyController:getAllCompanies.',
                error: e,
                httpResponseCode: 400,
                httpResponse: res,
            });
        }
    }

    getCompanyById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            if (!id) {
                throw new Error('Company ID is required.');
            }

            const company = await this.companyUsecase.getById(id);

            return res.json(company);
        } catch (e) {
            throw new CustomError({
                context: 'CompanyController:getCompanyById.',
                error: e,
                httpResponseCode: 400,
                httpResponse: res,
            });
        }
    }

    createCompany = async (req: Request, res: Response) => {
        try {
            const companyData = req.body as Partial<Company>;

            if (!companyData.name || !companyData.plan) {
                throw new Error('Name and plan are required fields.');
            }

            const newCompany = await this.companyUsecase.create(companyData);

            res.status(201).json(newCompany);
        } catch (e) {
            throw new CustomError({
                context: 'CompanyController:createCompany.',
                error: e,
                httpResponseCode: 400,
                httpResponse: res,
            });
        }
    }

    updateCompany = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const companyData = req.body as Partial<Company>;

            if (!id) {
                throw new Error('Company ID is required.');
            }

            const updatedCompany = await this.companyUsecase.update(id, companyData);


            return res.json(updatedCompany);
        } catch (e) {
            throw new CustomError({
                context: 'CompanyController:updateCompany.',
                error: e,
                httpResponseCode: 400,
                httpResponse: res,
            });
        }
    }

    deleteCompany = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            if (!id) {
                throw new Error('Company ID is required.');
            }

            const deleted = await this.companyUsecase.delete(id);

            if (!deleted) {
                return res.status(404).json({ message: 'Company not found' });
            }

            return res.status(200).json({ message: 'Company deleted successfully' });
        } catch (e) {
            throw new CustomError({
                context: 'CompanyController:deleteCompany.',
                error: e,
                httpResponseCode: 400,
                httpResponse: res,
            });
        }
    }
}
