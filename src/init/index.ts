import { Express } from 'express';
import { Controllers } from '../controllers/controllers';
import { Middlewares } from '../middlewares/middlewares';

import { Repositories } from '../repositories/repos';
import { Resolvers } from '../resolvers/resolvers';
import { Routes } from '../routes/routers';
import { Services } from '../services/services';
import { Usecases } from '../usecases/usecases';
import { ApolloServer } from './apolloServer';

export const initModules = async (api: Express) => {
    const repos = Repositories(Services);
    const usecases = Usecases(repos);
    const resolvers = Resolvers(usecases);
    const apolloServer = await ApolloServer(resolvers);
    const controllers = Controllers(usecases);
    const middlewares = Middlewares(Services);
    const routes = Routes(controllers, middlewares, apolloServer);

    api.use(routes);
};
