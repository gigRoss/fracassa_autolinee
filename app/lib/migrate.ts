import { migrate } from 'drizzle-orm/libsql/migrator';
import { getDb } from './db';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

/**
 * Apply database migrations
 * Run with: npm run db:migrate
 */
async function main() {
  console.log('🚀 Starting database migration...');
  
  try {
    const db = getDb();
    await migrate(db, { migrationsFolder: './drizzle/migrations' });
    
    console.log('✅ Migrations applied successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

main();


