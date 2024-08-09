import { Usecases } from '../usecases/usecases';
import { UsersResolver } from './users.resolver';

export const Resolvers = (usecases: ReturnType<typeof Usecases>) => {
    return [UsersResolver(usecases.mock)];
};
