import { Response } from 'express';
import { CustomError } from '../errors/CustomError';
import { RequestUserData } from '../types/misc';
import { HealthCheckUsecase } from '../usecases/healthcheck.usecase';

export class HealthCheckController {
    constructor(private healthcheck: HealthCheckUsecase) { }

    liveness = async (req: RequestUserData, res: Response) => {
        try {
            const status = await this.healthcheck?.liveness();
            if (status.status === 'DOWN') {
                console.error(JSON.stringify(status));
                res.status(500).send(status);
                return;
            }
            res.status(200).send(status);
        } catch (e) {
            throw new CustomError({
                context: 'HealthCheckController:liveness',
                error: e,
                httpResponseCode: 500,
                httpResponse: res,
            });
        }
    }
}
