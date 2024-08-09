import { json, Router } from 'express';

import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServer } from '../init/apolloServer';
import { AuthMiddlewares } from '../middlewares/auth.middleware';

export const GraphqlRouter = (
    apolloServer: Awaited<ReturnType<typeof ApolloServer>>,
    authMiddlewares: ReturnType<typeof AuthMiddlewares>
) => {
    const graphqlRouter = Router();

    graphqlRouter.post(
        '/v1/graphql',
        [json(), authMiddlewares.checkToken],
        expressMiddleware(apolloServer, {
            async context({ req }) {
                return {
                    userData: { ...req?.['userData'] },
                };
            },
        })
    );

    return graphqlRouter;
};
