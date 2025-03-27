import { Services } from '../services/services';
import { AuthRepo } from './auth.repo';
import { UserRepo } from './users.repo';

export const Repos = (services: typeof Services) => {
    const Repos = {
        auth: new AuthRepo(services.firebaseService),
        user: new UserRepo(),
    };

    return Repos;
};
