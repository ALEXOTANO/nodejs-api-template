import { Usecases } from '../usecases/usecases';
import { AgentsController } from './agents.controller';
import { AuthController } from './auth.controller';
import { CompanyController } from './company.controller';
import { ContactsController } from './contacts.controller';
import { ConversationsController } from './conversations.controller';
import { FlowsController } from './flows.controller';
import { HealthCheckController } from './healthcheck.controller';

export const Controllers = (usecases: ReturnType<typeof Usecases>) => {
    return {
        auth: new AuthController(usecases.authUsecase),
        contacts: new ContactsController(usecases.contactUsecase),
        conversations: new ConversationsController(usecases.conversationUsecase),
        healthcheck: new HealthCheckController(usecases.healthcheckUsecase),
        flows: new FlowsController(usecases.flowsUsecase),
        agents: new AgentsController(usecases.agentsUsecase),
        companies: new CompanyController(usecases.companyUsecase),
    };
}
