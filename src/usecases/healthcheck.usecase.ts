export class HealthCheckUsecase {
    async liveness() {
        //? We can do other checks here like checking the database connection, etc. to fail we respond with status: 'DOWN'
        return {
            status: 'UP',
        };
    }
}
