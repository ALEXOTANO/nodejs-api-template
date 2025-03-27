import { Router } from 'express';
import { HealthCheckController } from '../controllers/healthcheck.controller';
import { asyncErrorHandler } from '../errors/asyncErrorHandler';

export const HealthCheckRouter = (healthCheckController: HealthCheckController) => {
    const healthCheck = Router();

    healthCheck.get('/v1/healthcheck/liveness', [], asyncErrorHandler(healthCheckController.liveness));

    return healthCheck;
};
