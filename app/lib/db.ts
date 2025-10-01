import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

let dbInstance: ReturnType<typeof drizzle> | null = null;

/**
 * Get or create the database connection instance.
 * Uses singleton pattern to reuse connection across requests.
 * 
 * In development (DATABASE_MODE=local): connects to local SQLite file
 * In production: connects to Turso database using URL and auth token
 */
export function getDb() {
  if (!dbInstance) {
    const isLocal = process.env.DATABASE_MODE === 'local';
    
    const client = createClient({
      url: isLocal 
        ? 'file:./local.db' 
        : process.env.TURSO_DATABASE_URL!,
      authToken: isLocal 
        ? undefined 
        : process.env.TURSO_AUTH_TOKEN,
    });
    
    dbInstance = drizzle(client, { schema });
  }
  
  return dbInstance;
}

