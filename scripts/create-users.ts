// Script para crear los dos usuarios socios en la base de datos.
// Uso: DATABASE_URL=... npx tsx scripts/create-users.ts
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { users } from '../src/lib/db/schema';

const USERS = [
  {
    name: 'Socio 1',
    email: process.env.USER1_EMAIL ?? '',
    password: process.env.USER1_PASSWORD ?? '',
    role: 'admin',
  },
  {
    name: 'Socio 2',
    email: process.env.USER2_EMAIL ?? '',
    password: process.env.USER2_PASSWORD ?? '',
    role: 'socio',
  },
];

async function main() {
  for (const u of USERS) {
    if (!u.email || !u.password) {
      console.error(`Falta USER1_EMAIL/USER1_PASSWORD o USER2_EMAIL/USER2_PASSWORD`);
      process.exit(1);
    }
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
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
      .onConflictDoNothing();
    console.log(`✓ Usuario creado: ${u.email}`);
  }

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
