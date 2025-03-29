import { Services } from '../services/services';
import { AuthRepo } from './auth.repo';
import { CompanyRepo } from './companies.repo';
import { ContactRepo } from './contacts.repo';
import { ConversationRepo } from './conversations.repo';
import { UserRepo } from './users.repo';

export const Repositories = (services: typeof Services) => {
    return {

        authRepo: new AuthRepo(services.postgresService),
        userRepo: new UserRepo(services.postgresService, services.SupabaseService),
        companyRepo: new CompanyRepo(services.postgresService),
        contactRepo: new ContactRepo(services.postgresService),
        conversationRepo: new ConversationRepo(services.postgresService),
    }
}
