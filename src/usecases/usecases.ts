import { Repositories } from '../repositories/repos';
import { AuthUsecase } from './auth.usecase';
import { CompanyUsecase } from './company.usecase';
import { ContactUsecase } from './contact.usecase';
import { ConversationUsecase } from './conversation.usecase';
import { HealthCheckUsecase } from './healthcheck.usecase';
import { UsersUsecase } from './user.usecase';

export function Usecases(repositories: ReturnType<typeof Repositories>) {
    return {
        authUsecase: new AuthUsecase(repositories.authRepo, repositories.userRepo),
        companyUsecase: new CompanyUsecase(repositories.companyRepo),
        contactUsecase: new ContactUsecase(repositories.contactRepo),
        conversationUsecase: new ConversationUsecase(repositories.conversationRepo),
        healthcheckUsecase: new HealthCheckUsecase(),
        userUsecase: new UsersUsecase(repositories.userRepo),
    };
}
