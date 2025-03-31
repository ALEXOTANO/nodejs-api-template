import { Router } from 'express';
import { CompanyController } from '../controllers/company.controller';
import { asyncErrorHandler } from '../errors/asyncErrorHandler';
import { AuthMiddlewares } from '../middlewares/auth.middleware';

export const CompanyRouter = (
    companyController: CompanyController,
    authMiddleware: ReturnType<typeof AuthMiddlewares>
): Router => {
    const router = Router();

    // Route for getting all companies
    router.get('/v1/companies', [authMiddleware.checkToken], asyncErrorHandler(companyController.getAllCompanies));

    // Route for getting a company by ID
    router.get('/v1/companies/:id', [authMiddleware.checkToken], asyncErrorHandler(companyController.getCompanyById));

    // Route for creating a new company
    router.post('/v1/companies', [authMiddleware.checkToken], asyncErrorHandler(companyController.createCompany));

    // Route for updating an existing company
    router.put('/v1/companies/:id', [authMiddleware.checkToken], asyncErrorHandler(companyController.updateCompany));

    // Route for deleting a company
    router.delete('/v1/companies/:id', [authMiddleware.checkToken], asyncErrorHandler(companyController.deleteCompany));

    return router;
};
