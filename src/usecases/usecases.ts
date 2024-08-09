import { Repos } from '../repositories/repos';
import { AuthUsecase } from './auth.usecase';
import { HealthCheckUsecase } from './healthcheck.usecase';
import { UsersUsecase } from './user.usecase';

export const Usecases = (repos: ReturnType<typeof Repos>) => {
    return {
        auth: AuthUsecase(repos.auth, repos.user),
        mock: UsersUsecase(repos.user),
        healthCheckUsecase: HealthCheckUsecase(),
    };
};
