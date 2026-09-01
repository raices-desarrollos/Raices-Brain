#!/usr/bin/env tsx
import { randomUUID } from 'crypto';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { projects } from '../src/lib/db/schema';
import { PROJECT_CATALOG } from '../src/lib/domain/catalog';
import { loadDotenv } from './load-env';

loadDotenv();

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('Falta DATABASE_URL');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  const db = drizzle(pool);

  console.log('Seed de proyectos…');
  for (const p of PROJECT_CATALOG) {
    await db
      .insert(projects)
      .values({
        id: randomUUID(),
        slug: p.slug,
        name: p.name,
        address: p.address,
        neighborhood: p.neighborhood,
        city: p.city,
        status: p.status,
        floorsDescription: p.floorsDescription,
        notes: p.notes,
      })
      .onConflictDoNothing({ target: projects.slug });
    console.log(`  · ${p.name}`);
  }

  await pool.end();
  console.log('Listo.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
