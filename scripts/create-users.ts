#!/usr/bin/env tsx
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { users } from '../src/lib/db/schema';
import { loadDotenv } from './load-env';

loadDotenv();

const USERS = [
  {
    name: process.env.USER1_NAME ?? 'Socio 1',
    email: process.env.USER1_EMAIL ?? '',
    password: process.env.USER1_PASSWORD ?? '',
    role: 'admin',
  },
  {
    name: process.env.USER2_NAME ?? 'Socio 2',
    email: process.env.USER2_EMAIL ?? '',
    password: process.env.USER2_PASSWORD ?? '',
    role: 'socio',
  },
  {
    name: process.env.USER3_NAME ?? 'Socio 3',
    email: process.env.USER3_EMAIL ?? '',
    password: process.env.USER3_PASSWORD ?? '',
    role: 'socio',
  },
].filter((u) => u.email && u.password);

async function main() {
  if (USERS.length === 0) {
    console.error('Definí USER1_EMAIL/USER1_PASSWORD (y USER2, USER3) en .env.local');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
    ssl: { rejectUnauthorized: false },
  });
  const db = drizzle(pool);

  for (const u of USERS) {
    const hash = await bcrypt.hash(u.password, 12);
    await db
      .insert(users)
      .values({
        id: randomUUID(),
        name: u.name,
        email: u.email.toLowerCase(),
        passwordHash: hash,
        role: u.role,
      })
      .onConflictDoUpdate({
        target: users.email,
        set: { name: u.name, passwordHash: hash, role: u.role, active: true },
      });
    console.log(`✓ ${u.email}`);
  }

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
