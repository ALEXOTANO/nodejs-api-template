import { Response } from 'express';
import { CustomError } from '../errors/CustomError';
import { Agent } from '../types/entities';
import { RequestUserData } from '../types/misc';
import { AgentsUsecase } from '../usecases/agents.usecase';
import { checkIfisAuthorize } from '../utils/authUtils';

export class AgentsController {
    constructor(private agentsUsecase: AgentsUsecase) { }

    createAgent = async (req: RequestUserData, res: Response) => {
        try {
            const agentData = req.body as Partial<Agent>;

            if (!agentData.company_id || !agentData.name) {
                throw new Error('company_id and name are required fields.');
            }
            if (!checkIfisAuthorize(req, 'company_id', agentData.company_id)) return

            const newAgent = await this.agentsUsecase.createAgent(agentData);

            res.status(201).json(newAgent);
        } catch (e) {
            throw new CustomError({
                context: 'AgentsController:createAgent.',
                error: e,
                httpResponseCode: 400,
                httpResponse: res,
            });
        }
    }

    updateAgent = async (req: RequestUserData, res: Response) => {
        try {
            const { id } = req.params;
            const agentData = req.body as Partial<Agent>;
            if (!agentData.company_id) {
                throw new Error('company_id is a required fields.');
            }

            if (!checkIfisAuthorize(req, 'company_id', agentData.company_id)) return

            if (!id) {
                throw new Error('Agent ID is required.');
            }

            const updatedAgent = await this.agentsUsecase.updateAgent(id, agentData);

            res.json(updatedAgent);
        } catch (e) {
            throw new CustomError({
                context: 'AgentsController:updateAgent.',
                error: e,
                httpResponseCode: 400,
                httpResponse: res,
            });
        }
    }
}
