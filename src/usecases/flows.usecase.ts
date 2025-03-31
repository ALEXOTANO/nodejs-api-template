import { CustomError } from '../errors/CustomError';
import { FlowsRepo } from '../repositories/flows.repo';
import { Flow } from '../types/entities';

export class FlowsUsecase {
    constructor(
        private flowsRepo: FlowsRepo
    ) { }

    async getFlows(): Promise<Flow[]> {
        return this.flowsRepo.get();
    }

    async getFlowById(id: string): Promise<Flow> {
        const flow = await this.flowsRepo.getById(id);
        if (!flow) {
            throw new CustomError({ message: 'Flow not found.' });
        }
        return flow;
    }

    async getFlowsByPlatformId(platformId: string): Promise<Flow[]> {
        return this.flowsRepo.getByPlatformId(platformId);
    }

    async getFlowsByCompanyId(companyId: string): Promise<Flow[]> {
        return this.flowsRepo.getByCompanyId(companyId);
    }

    async createFlow(flowData: Partial<Flow>): Promise<Flow> {
        try {
            return await this.flowsRepo.create(flowData);
        } catch (error) {
            throw new CustomError({
                message: 'Failed to create flow.',
                error
            });
        }
    }

    async updateFlow(id: string, flowData: Partial<Flow>): Promise<Flow> {
        try {
            return await this.flowsRepo.update(id, flowData);
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError({
                message: 'Failed to update flow.',
                error
            });
        }
    }

    async deleteFlow(id: string): Promise<Flow> {
        try {
            return await this.flowsRepo.delete(id);
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError({
                message: 'Failed to delete flow.',
                error
            });
        }
    }
}
