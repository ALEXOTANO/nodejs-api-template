export const HealthCheckUsecase = () => {
    const liveness = async () => {
        //? We can do other checks here like checking the database connection, etc. to fail we respond with status: 'DOWN'
        return {
            status: 'UP',
        };
    };
    return {
        liveness,
    };
};
