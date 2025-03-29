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
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255) NOT NULL,
      company_name VARCHAR(255),
      needs TEXT,
      email VARCHAR(255) NOT NULL,
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
      session_id VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      contact_id UUID NOT NULL,
      company_id UUID NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      deleted_at TIMESTAMP WITH TIME ZONE,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      FOREIGN KEY (contact_id) REFERENCES contacts(id),
      FOREIGN KEY (company_id) REFERENCES companies(id)
    )
  `);
    console.log('Created conversations table');
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
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      phone VARCHAR(50) NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      deleted_at TIMESTAMP WITH TIME ZONE,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )
  `);
    console.log('Created users table');
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
        await createConversationsTable(client);
        await createUsersTable(client);

        // Commit transaction
        await client.query('COMMIT');

        console.log('All tables created successfully');
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
