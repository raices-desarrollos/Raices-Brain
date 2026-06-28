// Schema de la base de datos con Drizzle ORM
// Define las tablas de PostgreSQL para Raíces Brain
// TODO: Completar cuando se instale Drizzle ORM y pgvector

// import { pgTable, text, timestamp, boolean, real, jsonb, vector } from 'drizzle-orm/pg-core'
// import { sql } from 'drizzle-orm'

// ─── Documentos indexados ────────────────────────────────────────────────────
// export const documents = pgTable('documents', {
//   id: text('id').primaryKey(),
//   title: text('title').notNull(),
//   content: text('content').notNull(),
//   source: text('source').notNull(), // github | google-drive | manual-upload
//   sourceUrl: text('source_url'),
//   project: text('project'),
//   category: text('category'),
//   tags: text('tags').array(),
//   isConfidential: boolean('is_confidential').default(false),
//   embedding: vector('embedding', { dimensions: 3072 }), // text-embedding-3-large
//   createdAt: timestamp('created_at').defaultNow(),
//   updatedAt: timestamp('updated_at').defaultNow(),
// })

// ─── Proyectos ───────────────────────────────────────────────────────────────
// export const projects = pgTable('projects', {
//   id: text('id').primaryKey(),
//   slug: text('slug').unique().notNull(),
//   name: text('name').notNull(),
//   status: text('status').notNull(),
//   data: jsonb('data'), // datos adicionales del proyecto
//   createdAt: timestamp('created_at').defaultNow(),
//   updatedAt: timestamp('updated_at').defaultNow(),
// })

// ─── Terrenos ────────────────────────────────────────────────────────────────
// export const terrains = pgTable('terrains', {
//   id: text('id').primaryKey(),
//   address: text('address').notNull(),
//   neighborhood: text('neighborhood'),
//   status: text('status').notNull(),
//   data: jsonb('data'),
//   createdAt: timestamp('created_at').defaultNow(),
// })

// ─── Decisiones ──────────────────────────────────────────────────────────────
// export const decisions = pgTable('decisions', {
//   id: text('id').primaryKey(),
//   title: text('title').notNull(),
//   project: text('project').notNull(),
//   area: text('area').notNull(),
//   date: text('date').notNull(),
//   status: text('status').notNull(),
//   data: jsonb('data'),
//   sourceFile: text('source_file'),
// })

// Placeholder: descomentar y adaptar cuando se instale Drizzle ORM
export const schema = {}; // TODO: Implementar schema real
