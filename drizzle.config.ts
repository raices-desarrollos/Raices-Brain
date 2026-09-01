import type { Config } from 'drizzle-kit';
import { loadDotenv } from './scripts/load-env';

loadDotenv();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('Falta DATABASE_URL');
}

const dbUrl = new URL(connectionString);

export default {
  schema: './src/lib/db/schema.ts',
  out: './src/lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: dbUrl.hostname,
    port: dbUrl.port ? Number(dbUrl.port) : 5432,
    user: decodeURIComponent(dbUrl.username),
    password: decodeURIComponent(dbUrl.password),
    database: dbUrl.pathname.replace(/^\//, '') || 'postgres',
    ssl: { rejectUnauthorized: false },
  },
} satisfies Config;
