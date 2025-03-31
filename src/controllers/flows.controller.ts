import { Response } from 'express';
import { CustomError } from '../errors/CustomError';
import { Flow } from '../types/entities';
import { RequestUserData } from '../types/misc';
import { FlowsUsecase } from '../usecases/flows.usecase';
import { checkIfisAuthorize } from '../utils/authUtils';

export class FlowsController {
    constructor(private flowsUsecase: FlowsUsecase) { }

    createFlow = async (req: RequestUserData, res: Response) => {
        try {
            const flowData = req.body as Partial<Flow>;

            if (!checkIfisAuthorize(req, 'company_id', flowData.company_id)) return

            if (!flowData.type || !flowData.platform_id) {
                throw new Error('company_id, type, and platform_id are required fields.');
            }

            const newFlow = await this.flowsUsecase.createFlow(flowData);

            res.status(201).json(newFlow);
        } catch (e) {
            throw new CustomError({
                context: 'FlowsController:createFlow.',
                error: e,
                httpResponseCode: 400,
                httpResponse: res,
            });
        }
    }

    updateFlow = async (req: RequestUserData, res: Response) => {
        try {
            const { id } = req.params;
            const flowData = req.body as Partial<Flow>;

            if (!id) {
                throw new Error('Flow ID is required.');
            }
            if (!flowData.company_id) {
                throw new Error('company_id is required.');
            }
            if (!checkIfisAuthorize(req, 'company_id', flowData.company_id)) return

            const updatedFlow = await this.flowsUsecase.updateFlow(id, flowData);

            res.json(updatedFlow);
        } catch (e) {
            throw new CustomError({
                context: 'FlowsController:updateFlow.',
                error: e,
                httpResponseCode: 400,
                httpResponse: res,
            });
        }
    }
}
