import { UserRepo } from '../repositories/users.repo';
import { User } from '../types/entities';


export class UsersUsecase {
    constructor(
        private userRepo: UserRepo
    ) { }

    async getUsers() {
        return this.userRepo.get();
    }

    async getById(id: string) {
        return this.userRepo.getById(id);
    }

    async create(contact: User) {
        return this.userRepo.create(contact);
    }
}
