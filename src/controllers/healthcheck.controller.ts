import { Response } from 'express';
import { CustomError } from '../errors/CustomError';
import { RequestUserData } from '../types/misc';
import { HealthCheckUsecase } from '../usecases/healthcheck.usecase';

export const HealthCheckController = (healthcheck: ReturnType<typeof HealthCheckUsecase>) => {
    const liveness = async (req: RequestUserData, res: Response) => {
        try {
            const status = await healthcheck.liveness();
            if (status.status === 'DOWN') {
                console.error(JSON.stringify(status));
                res.status(500).send(status);
                return;
            }
            res.status(200).send(status);
        } catch (e) {
            throw new CustomError({
                message: 'HealthCheckController:liveness',
                error: e,
                httpResponseCode: 500,
                httpResponse: res,
            });
        }
    };

    return {
        liveness,
    };
};