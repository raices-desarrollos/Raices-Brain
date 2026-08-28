import {
    boolean,
    customType,
    integer,
    jsonb,
    pgTable,
    real,
    text,
    timestamp,
} from 'drizzle-orm/pg-core';

// pgvector column type — dimensions must match the embedding model used
const vector = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return 'vector(1536)';
  },
  toDriver(value: number[]) {
    return JSON.stringify(value);
  },
  fromDriver(value: unknown) {
    if (typeof value === 'string') return JSON.parse(value);
    return value as number[];
  },
});

// ─── Usuarios ────────────────────────────────────────────────────────────────
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('socio'), // 'admin' | 'socio'
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ─── Factibilidades ──────────────────────────────────────────────────────────
export const feasibilities = pgTable('feasibilities', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  neighborhood: text('neighborhood'),
  date: text('date').notNull(),
  observations: text('observations'),
  inputs: jsonb('inputs').notNull(), // FeasibilityInputs
  currency: text('currency').notNull().default('USD'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  createdBy: text('created_by').references(() => users.id),
  updatedBy: text('updated_by').references(() => users.id),
});

// ─── Contactos ───────────────────────────────────────────────────────────────
export const contacts = pgTable('contacts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  company: text('company'),
  category: text('category').notNull(), // ver CONTACT_CATEGORIES
  phone: text('phone'),
  email: text('email'),
  notes: text('notes'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  createdBy: text('created_by').references(() => users.id),
});

// ─── Pagos ───────────────────────────────────────────────────────────────────
export const payments = pgTable('payments', {
  id: text('id').primaryKey(),
  concept: text('concept').notNull(),
  amount: real('amount').notNull(),
  currency: text('currency').notNull().default('USD'),
  type: text('type').notNull(), // 'ingreso' | 'egreso'
  category: text('category').notNull(),
  dueDate: text('due_date'),
  paidDate: text('paid_date'),
  status: text('status').notNull().default('pendiente'), // 'pendiente' | 'pagado' | 'vencido' | 'cancelado'
  contactId: text('contact_id').references(() => contacts.id),
  projectRef: text('project_ref'), // libre: nombre de proyecto o terreno
  observations: text('observations'),
  documentId: text('document_id'), // ref a documents tabla
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  createdBy: text('created_by').references(() => users.id),
  updatedBy: text('updated_by').references(() => users.id),
});

// ─── Documentos ──────────────────────────────────────────────────────────────
export const documents = pgTable('documents', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(), // bytes
  storageKey: text('storage_key').notNull(), // path en storage (no público)
  contactId: text('contact_id').references(() => contacts.id),
  paymentId: text('payment_id').references(() => payments.id),
  feasibilityId: text('feasibility_id').references(() => feasibilities.id),
  projectRef: text('project_ref'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  createdBy: text('created_by').references(() => users.id),
});

// ─── Audit log ───────────────────────────────────────────────────────────────
export const auditLog = pgTable('audit_log', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  action: text('action').notNull(), // 'login' | 'create' | 'update' | 'delete' | 'upload' | 'download'
  entity: text('entity').notNull(), // 'feasibility' | 'contact' | 'payment' | 'document'
  entityId: text('entity_id'),
  details: text('details'),
  ip: text('ip'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ─── Knowledge chunks (RAG) ──────────────────────────────────────────────────
export const knowledgeChunks = pgTable('knowledge_chunks', {
  id: text('id').primaryKey(),
  filePath: text('file_path').notNull(), // relativo a knowledge/
  heading: text('heading').notNull(),
  content: text('content').notNull(),
  embedding: vector('embedding').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
// ─── Financial snapshots (Drive sync) ────────────────────────────────────────
export const financialSnapshots = pgTable('financial_snapshots', {
  id: text('id').primaryKey(),
  source: text('source').notNull(),
  driveFileId: text('drive_file_id'),
  kpis: jsonb('kpis').notNull(),
  syncedAt: timestamp('synced_at', { withTimezone: true }).defaultNow(),
});

// ─── Reuniones (detectadas desde Google Docs) ─────────────────────────────────
export const meetings = pgTable('meetings', {
  id: text('id').primaryKey(),
  docId: text('doc_id').notNull(),
  docTitle: text('doc_title'),
  meetingDate: text('meeting_date').notNull(), // "2026-08-05"
  rawSection: text('raw_section'), // bloque de texto original
  projectRef: text('project_ref'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ─── Tareas ───────────────────────────────────────────────────────────────────
export const tasks = pgTable('tasks', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  // 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE'
  status: text('status').notNull().default('TODO'),
  assignedTo: text('assigned_to'), // email o nombre libre
  projectRef: text('project_ref'),
  dueDate: text('due_date'),
  // 'MANUAL' | 'IMPORTED'
  origin: text('origin').notNull().default('MANUAL'),
  meetingId: text('meeting_id').references(() => meetings.id),
  originalText: text('original_text'), // texto crudo del Doc
  docId: text('doc_id'),
  importHash: text('import_hash').unique(), // SHA256 dedup
  blockedByTaskId: text('blocked_by_task_id'), // self-ref (no FK circular)
  blockedReason: text('blocked_reason'),
  createdBy: text('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ─── Candidatos de importación (inbox de revisión) ────────────────────────────
export const importCandidates = pgTable('import_candidates', {
  id: text('id').primaryKey(),
  docId: text('doc_id').notNull(),
  docTitle: text('doc_title'),
  meetingDate: text('meeting_date'),
  originalText: text('original_text').notNull(),
  suggestedTitle: text('suggested_title'),
  // 'TASK' | 'DECISION' | 'NOTE' | 'AMBIGUOUS'
  aiType: text('ai_type').notNull().default('TASK'),
  aiAssignee: text('ai_assignee'),
  aiProjectRef: text('ai_project_ref'),
  aiNotes: text('ai_notes'),
  importHash: text('import_hash').unique().notNull(),
  // 'PENDING' | 'CONFIRMED' | 'DISCARDED'
  status: text('status').notNull().default('PENDING'),
  taskId: text('task_id'), // set after confirmation
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  syncedAt: timestamp('synced_at', { withTimezone: true }).defaultNow(),
});

// ─── Sincronizaciones de Google Doc ──────────────────────────────────────────
export const documentSyncs = pgTable('document_syncs', {
  id: text('id').primaryKey(),
  docId: text('doc_id').notNull(),
  docTitle: text('doc_title'),
  lastSyncAt: timestamp('last_sync_at', { withTimezone: true }),
  // 'ok' | 'error' | 'never'
  lastSyncStatus: text('last_sync_status').notNull().default('never'),
  lastSyncError: text('last_sync_error'),
  candidatesFound: integer('candidates_found').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
