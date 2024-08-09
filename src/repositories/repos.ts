import { Services } from '../services/services';
import { AuthRepo } from './auth.repo';
import { UserRepo } from './users.repo';

export const Repos = (services: typeof Services) => {
    const Repos = {
        auth: AuthRepo(services.firebaseService),
        user: UserRepo(),
    };

    return Repos;
};
