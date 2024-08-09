import { Controllers } from '../controllers/controllers';
import { ApolloServer } from '../init/apolloServer';
import { Middlewares } from '../middlewares/middlewares';
import { GraphqlRouter } from './graphQL.router';
import { HealthCheckRouter } from './healthcheck.router';

export const Routes = (
    controllers: ReturnType<typeof Controllers>,
    middlewares: ReturnType<typeof Middlewares>,
    apolloServer: Awaited<ReturnType<typeof ApolloServer>>
) => {
    return [GraphqlRouter(apolloServer, middlewares.authMiddlewares), HealthCheckRouter(controllers.healthCheck)];
};
