import { CustomError } from '../errors/CustomError';
import { AgentsRepo } from '../repositories/agents.repo';
import { Agent } from '../types/entities';

export class AgentsUsecase {
    constructor(
        private agentsRepo: AgentsRepo
    ) { }

    async getAgents(): Promise<Agent[]> {
        return this.agentsRepo.get();
    }

    async getAgentById(id: string): Promise<Agent> {
        const agent = await this.agentsRepo.getById(id);
        if (!agent) {
            throw new CustomError({ message: 'Agent not found.' });
        }
        return agent;
    }

    async getAgentsByCompanyId(companyId: string): Promise<Agent[]> {
        return this.agentsRepo.getByCompanyId(companyId);
    }

    async createAgent(agentData: Partial<Agent>): Promise<Agent> {
        try {
            return await this.agentsRepo.create(agentData);
        } catch (error) {
            throw new CustomError({
                message: 'Failed to create agent.',
                error
            });
        }
    }

    async updateAgent(id: string, agentData: Partial<Agent>): Promise<Agent> {
        try {
            return await this.agentsRepo.update(id, agentData);
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError({
                message: 'Failed to update agent.',
                error
            });
        }
    }

    async deleteAgent(id: string): Promise<Agent> {
        try {
            return await this.agentsRepo.delete(id);
        } catch (error) {
            if (error instanceof CustomError) {
                throw error;
            }
            throw new CustomError({
                message: 'Failed to delete agent.',
                error
            });
        }
    }
}
