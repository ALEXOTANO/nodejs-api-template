import { ApolloServer as Apollo } from '@apollo/server';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { mergeResolvers, mergeTypeDefs } from '@graphql-tools/merge';
import fs, { readFileSync } from 'fs';
import { GraphQLError } from 'graphql';
import gql from 'graphql-tag';
import path from 'path';
import { CustomError } from '../errors/CustomError';
import { Resolvers as ResolverRepo } from '../resolvers/resolvers';
import { Resolvers } from '../types/autogen/types';

export const ApolloServer = async (resolvers: ReturnType<typeof ResolverRepo>) => {
    try {
        const gqlSchemmaDir = path.join(__dirname, '../', 'graphQL');

        const gqlSchemmaFiles = fs.readdirSync(gqlSchemmaDir).reduce((acc, file) => {
            if (file.endsWith('.graphql')) {
                acc.push(gql(readFileSync(path.join(gqlSchemmaDir, file), { encoding: 'utf-8' })));
            }
            return acc;
        }, []);

        const mergedTypeDefs = mergeTypeDefs(gqlSchemmaFiles);

        const mergedResolvers = mergeResolvers([...resolvers]) as Resolvers;

        const server = new Apollo({
            schema: buildSubgraphSchema({ typeDefs: mergedTypeDefs, resolvers: mergedResolvers }),
            formatError(formattedErr, err: GraphQLError) {
                if (!(err.originalError instanceof CustomError)) {
                    // Track error else where if needed
                    console.error(err.message);
                }

                return { ...formattedErr, message: formattedErr.message, code: formattedErr.extensions.code };
            },
        });

        await server.start();

        return server;
    } catch (err) {
        throw new Error(`Error starting Apollo Server: ${err?.message}`);
    }
};
