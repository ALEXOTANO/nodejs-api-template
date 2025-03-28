import { Pool, PoolClient, QueryResult } from 'pg';

export class PostgresService {
    private pool: Pool;

    constructor() {
        // First connect to the default postgres database to check if our target DB exists
        const tempPool = new Pool({
            host: process.env.POSTGRES_HOST,
            port: Number(process.env.POSTGRES_PORT) || 5432,
            database: 'postgres', // Connect to default postgres database first
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false,
        });

        // Check if our target database exists and create it if not
        const dbName = process.env.POSTGRES_DB;
        tempPool.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName])
            .then(async (result) => {
                if (result.rowCount === 0) {
                    console.log(`Database ${dbName} does not exist, creating it now...`);
                    await tempPool.query(`CREATE DATABASE ${dbName}`);
                    console.log(`Database ${dbName} created successfully`);
                }
                // Close temp connection
                await tempPool.end();

                // Now connect to our target database
                this.connectToDatabase();
            })
            .catch(err => {
                console.error('Error checking database existence:', err);
                tempPool.end();
                // Still try to connect to the main database
                this.connectToDatabase();
            });
    }

    private connectToDatabase(): void {
        this.pool = new Pool({
            host: process.env.POSTGRES_HOST,
            port: Number(process.env.POSTGRES_PORT) || 5432,
            database: process.env.POSTGRES_DB,
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : false,
        });

        // Test the connection
        this.pool.query('SELECT NOW()')
            .then(() => console.log('PostgreSQL connected successfully'))
            .catch(err => console.error('PostgreSQL connection error:', err));

        // Handle pool errors
        this.pool.on('error', (err: Error) => {
            console.error('Unexpected error on idle PostgreSQL client', err);
        });
    }

    /**
     * Execute a query with parameters
     */
    async query<T>(text: string, params?: any[]): Promise<QueryResult<T>> {
        return this.pool.query(text, params);
    }

    /**
     * Get a client from the pool for transactions
     */
    async getClient(): Promise<PoolClient> {
        return await this.pool.connect();
    }

    /**
     * Execute a transaction with multiple queries
     */
    async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
        const client = await this.pool.connect();

        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    /**
     * Close all connections in the pool
     */
    async close(): Promise<void> {
        await this.pool.end();
    }
}

// Create a singleton instance
export const postgresService = new PostgresService();
