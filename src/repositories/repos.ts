import { Services } from '../services/services';
import { AgentsRepo } from './agents.repo';
import { AuthRepo } from './auth.repo';
import { CompanyRepo } from './company.repo';
import { ContactRepo } from './contacts.repo';
import { ConversationRepo } from './conversations.repo';
import { FlowsRepo } from './flows.repo';
import { MessageRepo } from './messages.repo';
import { UserRepo } from './users.repo';

export const Repositories = (services: typeof Services) => {
    return {
        authRepo: new AuthRepo(services.postgresService, services.SupabaseService),
        userRepo: new UserRepo(services.postgresService, services.SupabaseService),
        companyRepo: new CompanyRepo(services.postgresService),
        contactRepo: new ContactRepo(services.postgresService),
        conversationRepo: new ConversationRepo(services.postgresService),
        flowsRepo: new FlowsRepo(services.postgresService),
        agentsRepo: new AgentsRepo(services.postgresService),
        messageRepo: new MessageRepo(services.postgresService),
    }
}
