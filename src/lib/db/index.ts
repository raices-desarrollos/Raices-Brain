// Conexión a la base de datos con Drizzle ORM
// TODO: Configurar con PostgreSQL + pgvector

// import { drizzle } from 'drizzle-orm/postgres-js'
// import postgres from 'postgres'
// import * as schema from './schema'

// const client = postgres(process.env.DATABASE_URL!)
// export const db = drizzle(client, { schema })

// Placeholder: descomentar cuando se instalen las dependencias
// npm install drizzle-orm postgres
// npm install -D drizzle-kit @types/pg

export const db = null; // TODO: Implementar conexión real

export type Database = typeof db;
