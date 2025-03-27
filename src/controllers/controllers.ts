import { Usecases } from '../usecases/usecases';
import { AuthController } from './auth.controller';
import { HealthCheckController } from './healthcheck.controller';

export const Controllers = (usecase: ReturnType<typeof Usecases>) => {
    return {
        auth: new AuthController(usecase.auth),
        healthCheck: new HealthCheckController(usecase.healthCheckUsecase),
    };
};
