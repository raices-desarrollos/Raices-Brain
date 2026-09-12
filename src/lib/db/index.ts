import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL env var is required');
}

const connectionString = process.env.DATABASE_URL;
const isLocalDb = /localhost|127\.0\.0\.1/.test(connectionString);

function createPool() {
  return new Pool({
    connectionString,
    // En serverless cada instancia levanta su propio pool, así que muchas
    // instancias con un max alto agotan las conexiones de Postgres.
    max: isLocalDb ? 10 : 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    ssl: isLocalDb ? false : { rejectUnauthorized: false },
  });
}

/**
 * En desarrollo, Next recarga los módulos en cada cambio. Sin este caché en
 * globalThis cada recarga dejaba un pool huérfano con sus conexiones abiertas.
 */
const globalForDb = globalThis as unknown as { __raicesPool?: Pool };

const pool = globalForDb.__raicesPool ?? createPool();
if (process.env.NODE_ENV !== 'production') globalForDb.__raicesPool = pool;

// Un error de socket en una conexión idle no debe tumbar el proceso.
pool.on('error', (err) => {
  console.error('[db] error en conexión idle:', err.message);
});

export const db = drizzle(pool, { schema });
export type DB = typeof db;
