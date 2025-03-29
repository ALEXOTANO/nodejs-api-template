import { Usecases } from '../usecases/usecases';
import { AuthController } from './auth.controller';
import { ContactsController } from './contacts.controller';
import { ConversationsController } from './conversations.controller';
import { HealthCheckController } from './healthcheck.controller';

export const Controllers = (usecases: ReturnType<typeof Usecases>) => {
    return {
        auth: new AuthController(usecases.authUsecase),
        contacts: new ContactsController(usecases.contactUsecase),
        conversations: new ConversationsController(usecases.conversationUsecase),
        healthcheck: new HealthCheckController(usecases.healthcheckUsecase),
    };
}
