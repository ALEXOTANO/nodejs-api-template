import { UserRepo } from '../repositories/users.repo';
import { User } from '../types/autogen/types';

export const UsersUsecase = (userRepo: ReturnType<typeof UserRepo>) => {
    const getUsers = async () => {
        return userRepo.get();
    };
    const getById = async (id: string) => {
        return userRepo.getById(id);
    };

    const create = async (contact: User) => {
        return userRepo.create(contact);
    };

    return {
        getUsers,
        getById,
        create,
    };
};
