import { Services } from '../services/services';
import { AuthRepo } from './auth.repo';
import { CompanyRepo } from './companies.repo';
import { ContactRepo } from './contacts.repo';
import { ConversationRepo } from './conversations.repo';
import { UserRepo } from './users.repo';

export const Repos = (services: typeof Services) => {
    const Repos = {
        auth: new AuthRepo(services.firebaseService),
        user: new UserRepo(),
        company: new CompanyRepo(services.postgresService),
        contact: new ContactRepo(services.postgresService),
        conversation: new ConversationRepo(services.postgresService)
    };
    return Repos;
};
