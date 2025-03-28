import { Repos } from '../repositories/repos';
import { AuthUsecase } from './auth.usecase';
import { CompanyUsecase } from './company.usecase';
import { ContactUsecase } from './contact.usecase';
import { ConversationUsecase } from './conversation.usecase';
import { HealthCheckUsecase } from './healthcheck.usecase';
import { UsersUsecase } from './user.usecase';

export const Usecases = (repos: ReturnType<typeof Repos>) => {
    const Usecases = {
        auth: new AuthUsecase(repos.auth),
        healthCheck: new HealthCheckUsecase(),
        users: new UsersUsecase(repos.user),
        company: new CompanyUsecase(repos.company),
        contact: new ContactUsecase(repos.contact),
        conversation: new ConversationUsecase(repos.conversation)
    };
    return Usecases;
};
