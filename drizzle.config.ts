import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

export default {
  schema: './app/lib/schema.ts',
  out: './drizzle/migrations',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.DATABASE_MODE === 'local' 
      ? 'file:./local.db' 
      : process.env.TURSO_DATABASE_URL!,
    authToken: process.env.DATABASE_MODE === 'local' 
      ? undefined 
      : process.env.TURSO_AUTH_TOKEN,
  },
} satisfies Config;


