import { promises as fs } from 'fs';
import * as path from 'path';
import { Pool, PoolClient } from 'pg';

import { config } from 'dotenv';
config(); // Load environment variables from .env file

// Database connection configuration - adjust as needed for your environment
const dbConfig = {
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
};

// Helper function to check if a table exists
async function tableExists(client: PoolClient, tableName: string): Promise<boolean> {
    try {
        const result = await client.query(
            `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      )`,
            [tableName]
        );

        return result.rows[0].exists;
    } catch (error) {
        console.error(`Error checking if table ${tableName} exists:`, error);
        return false;
    }
}

// Helper function to check if a column exists in a table
async function columnExists(client: PoolClient, tableName: string, columnName: string): Promise<boolean> {
    try {
        const result = await client.query(
            `SELECT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = $1
                AND column_name = $2
            )`,
            [tableName, columnName]
        );

        return result.rows[0].exists;
    } catch (error) {
        console.error(`Error checking if column ${columnName} exists in table ${tableName}:`, error);
        return false;
    }
}

// Create companies table
async function createCompaniesTable(client: PoolClient): Promise<void> {
    const exists = await tableExists(client, 'companies');
    if (exists) {
        console.log('Table companies already exists, skipping...');
        return;
    }

    await client.query(`
    CREATE TABLE companies (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      plan VARCHAR(50) NOT NULL,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      deleted_at TIMESTAMP WITH TIME ZONE,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )
  `);
    console.log('Created companies table');
}

// Create contacts table
async function createContactsTable(client: PoolClient): Promise<void> {
    const exists = await tableExists(client, 'contacts');
    if (exists) {
        console.log('Table contacts already exists, skipping...');
        return;
    }

    await client.query(`
    CREATE TABLE contacts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      first_name VARCHAR(255),
      last_name VARCHAR(255),
      company_name VARCHAR(255),
      needs TEXT,
      email VARCHAR(255),
      phone_number VARCHAR(50),
      address TEXT,
      city VARCHAR(100),
      state VARCHAR(50),
      notes TEXT,
      company_id UUID NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      deleted_at TIMESTAMP WITH TIME ZONE,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      FOREIGN KEY (company_id) REFERENCES companies(id)
    )
  `);
    console.log('Created contacts table');
}

// Create conversations table
async function createConversationsTable(client: PoolClient): Promise<void> {
    const exists = await tableExists(client, 'conversations');
    if (exists) {
        console.log('Table conversations already exists, skipping...');
        return;
    }

    await client.query(`
    CREATE TABLE conversations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id BIGINT NOT NULL,
      contact_id UUID NOT NULL,
      flow_id UUID,
      agent_id UUID,
      message_count BIGINT DEFAULT 0,
      company_id UUID NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      deleted_at TIMESTAMP WITH TIME ZONE,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      FOREIGN KEY (contact_id) REFERENCES contacts(id),
      FOREIGN KEY (company_id) REFERENCES companies(id)
      
    )
  `);
    console.log('Created conversations table');
}

// Create messages table
async function createMessagesTable(client: PoolClient): Promise<void> {
    const exists = await tableExists(client, 'messages');
    if (exists) {
        console.log('Table messages already exists, skipping...');
        return;
    }

    await client.query(`
    CREATE TABLE messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      conversation_id UUID NOT NULL,
      company_id UUID NOT NULL,
      text TEXT NOT NULL,
      type VARCHAR(20),
      sender VARCHAR(10) NOT NULL CHECK (sender IN ('customer', 'human', 'bot')),
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      deleted_at TIMESTAMP WITH TIME ZONE,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      FOREIGN KEY (conversation_id) REFERENCES conversations(id),
      FOREIGN KEY (company_id) REFERENCES companies(id)
    )
  `);
    console.log('Created messages table');
}

// Create users table
async function createUsersTable(client: PoolClient): Promise<void> {
    const exists = await tableExists(client, 'users');
    if (exists) {
        console.log('Table users already exists, skipping...');
        return;
    }

    await client.query(`
    CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id UUID NOT NULL,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      phone VARCHAR(50) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'user',
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      deleted_at TIMESTAMP WITH TIME ZONE,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )
  `);
    console.log('Created users table');
}

// Create flows table
async function createFlowsTable(client: PoolClient): Promise<void> {
    const exists = await tableExists(client, 'flows');
    if (exists) {
        console.log('Table flows already exists, skipping...');
        return;
    }

    await client.query(`
    CREATE TABLE flows (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id UUID NOT NULL,
      type VARCHAR(20) NOT NULL CHECK (type IN ('whatsapp', 'email', 'messenger', 'web', 'ig', 'sms')),
      platform_id VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      deleted_at TIMESTAMP WITH TIME ZONE,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      FOREIGN KEY (company_id) REFERENCES companies(id)
    )
  `);
    console.log('Created flows table');
}

// Create agents table
async function createAgentsTable(client: PoolClient): Promise<void> {
    const exists = await tableExists(client, 'agents');
    if (exists) {
        console.log('Table agents already exists, skipping...');
        return;
    }

    await client.query(`
    CREATE TABLE agents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id UUID NOT NULL,
      flow_id UUID NOT NULL,
      name VARCHAR(255) NOT NULL,
      job_description TEXT NOT NULL,
      knowledge_base TEXT NOT NULL,
      tasks TEXT[] NOT NULL,
      rules TEXT[] NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      deleted_at TIMESTAMP WITH TIME ZONE,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      FOREIGN KEY (company_id) REFERENCES companies(id),
      FOREIGN KEY (flow_id) REFERENCES flows(id)
    )
  `);
    console.log('Created agents table');
}

// Generic function to add a column to any table
async function addColumnToTable(client: PoolClient, tableName: string, columnName: string, columnDefinition: string): Promise<void> {
    const exists = await columnExists(client, tableName, columnName);
    if (exists) {
        console.log(`Column ${columnName} in ${tableName} table already exists, skipping...`);
        return;
    }

    try {
        await client.query(`
            ALTER TABLE ${tableName}
            ADD COLUMN ${columnName} ${columnDefinition}
        `);
        console.log(`Added column ${columnName} to ${tableName} table`);
    } catch (error) {
        console.error(`Error adding column ${columnName} to ${tableName}:`, error);
    }
}

// Generic function to check if an index exists
async function indexExists(client: PoolClient, indexName: string): Promise<boolean> {
    try {
        const result = await client.query(
            `SELECT EXISTS (
                SELECT FROM pg_indexes 
                WHERE indexname = $1
            )`,
            [indexName]
        );

        return result.rows[0].exists;
    } catch (error) {
        console.error(`Error checking if index ${indexName} exists:`, error);
        return false;
    }
}

// Function to create indexes on company_id and created_at columns
async function createIndexes(client: PoolClient): Promise<void> {
    // Define indexes: table name, column name, and resulting index name
    const indexes = [
        // company_id indexes
        { table: 'contacts', column: 'company_id', name: 'idx_contacts_company_id' },
        { table: 'conversations', column: 'company_id', name: 'idx_conversations_company_id' },
        { table: 'messages', column: 'company_id', name: 'idx_messages_company_id' },
        { table: 'users', column: 'company_id', name: 'idx_users_company_id' },
        { table: 'flows', column: 'company_id', name: 'idx_flows_company_id' },
        { table: 'agents', column: 'company_id', name: 'idx_agents_company_id' },

        // created_at indexes
        { table: 'companies', column: 'created_at', name: 'idx_companies_created_at' },
        { table: 'contacts', column: 'created_at', name: 'idx_contacts_created_at' },
        { table: 'conversations', column: 'created_at', name: 'idx_conversations_created_at' },
        { table: 'messages', column: 'created_at', name: 'idx_messages_created_at' },
        { table: 'users', column: 'created_at', name: 'idx_users_created_at' },
        { table: 'flows', column: 'created_at', name: 'idx_flows_created_at' },
        { table: 'agents', column: 'created_at', name: 'idx_agents_created_at' }
    ];

    for (const index of indexes) {
        const exists = await indexExists(client, index.name);
        if (exists) {
            console.log(`Index ${index.name} already exists, skipping...`);
            continue;
        }

        try {
            await client.query(`
                CREATE INDEX ${index.name} ON ${index.table} (${index.column});
            `);
            console.log(`Created index ${index.name} on ${index.table}.${index.column}`);
        } catch (error) {
            console.error(`Error creating index ${index.name}:`, error);
        }
    }
}

// Apply all schema modifications
async function applySchemaModifications(client: PoolClient): Promise<void> {
    // Define your schema modifications here
    const schemaModifications = [
        // Missing 'role' column in users table
        { table: 'conversations', column: 'message_count', definition: 'BIGINT' },

        // Ensure any other missing columns are added
        // These would be run on subsequent executions of the script to update existing tables
        // without having to recreate them
    ];

    // Apply all modifications
    for (const mod of schemaModifications) {
        await addColumnToTable(client, mod.table, mod.column, mod.definition);
    }
}

// Main function to initialize all tables
async function initDatabase(): Promise<void> {
    const pool = new Pool(dbConfig);
    let client: PoolClient | null = null;

    try {
        // Create a database connection
        client = await pool.connect();
        console.log('Database connection established');

        // Start transaction
        await client.query('BEGIN');

        // Create tables in the right order (respecting foreign keys)
        await createCompaniesTable(client);
        await createContactsTable(client);
        await createFlowsTable(client);
        await createAgentsTable(client);
        await createConversationsTable(client);
        await createMessagesTable(client);
        await createUsersTable(client);

        // Apply schema modifications to existing tables
        await applySchemaModifications(client);

        // Create indexes for improved query performance
        await createIndexes(client);

        // Commit transaction
        await client.query('COMMIT');

        console.log('All database operations completed successfully');
    } catch (error) {
        // Rollback transaction if there's an error
        if (client) {
            await client.query('ROLLBACK');
        }
        console.error('Error initializing database:', error);
    } finally {
        if (client) {
            client.release();
        }
        await pool.end();
        console.log('Database connection closed');
    }
}

// Create scripts directory if it doesn't exist
async function ensureScriptsDir() {
    const scriptsDir = path.join(__dirname);
    try {
        await fs.mkdir(scriptsDir, { recursive: true });
    } catch (error) {
        console.error('Error creating scripts directory:', error);
    }
}

// Run the initialization
(async () => {
    await ensureScriptsDir();
    await initDatabase();
})();
