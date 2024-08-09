import { Resolvers } from '../types/autogen/types';
import { UsersUsecase } from '../usecases/user.usecase';

export const UsersResolver = (usersUsecase: ReturnType<typeof UsersUsecase>) => {
    const resolver: Resolvers = {
        Query: {
            getUsers(_, _args) {
                return usersUsecase.getUsers();
            },
        },
        Mutation: {
            createUser(_, { user }, _c, _args) {
                return usersUsecase.create(user);
            },
        },
    };
    return resolver;
};
