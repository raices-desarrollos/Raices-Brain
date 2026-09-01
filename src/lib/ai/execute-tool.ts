import { formatContext, searchKnowledge } from '@/lib/ai/search';
import { db } from '@/lib/db';
import { contacts, documents, financialSnapshots, invoices, payments, units } from '@/lib/db/schema';
import { getDriveFileText, searchDriveByName } from '@/lib/google/drive';
import { getLatestDecisions } from '@/lib/domain/decisions';
import { getProjectBySlug } from '@/lib/domain/projects';
import { and, desc, eq, ilike, or } from 'drizzle-orm';

function asString(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

function asNumber(v: unknown, fallback: number): number {
  return typeof v === 'number' && !Number.isNaN(v) ? v : fallback;
}

async function safe(fn: () => Promise<unknown>, empty: unknown): Promise<unknown> {
  try {
    return await fn();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'error';
    return { error: message, ...(empty as object) };
  }
}

export async function executeBrainTool(
  name: string,
  args: Record<string, unknown>,
): Promise<string> {
  try {
    const result = await runTool(name, args);
    return JSON.stringify(result);
  } catch (err) {
    return JSON.stringify({
      error: err instanceof Error ? err.message : 'Error al ejecutar la herramienta',
      tool: name,
    });
  }
}

async function runTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'search_knowledge': {
      const query = asString(args.query);
      if (!query) return { results: [] };
      try {
        const chunks = await searchKnowledge(query, 6);
        const relevant = chunks.filter((c) => c.similarity > 0.28);
        return {
          results: relevant.map((c) => ({
            heading: c.heading,
            path: c.filePath,
            similarity: Number(c.similarity.toFixed(3)),
            excerpt: c.content.slice(0, 800),
          })),
          context: formatContext(relevant),
        };
      } catch (err) {
        return {
          results: [],
          note: 'El índice de documentos internos no está disponible. Usá facturas, pagos o Drive.',
          error: err instanceof Error ? err.message : 'índice no disponible',
        };
      }
    }

    case 'get_project': {
      const slug = asString(args.slug) || 'ceibo-vidal';
      const project = await getProjectBySlug(slug);
      if (!project) return { error: 'Proyecto no encontrado', slug };
      return project;
    }

    case 'get_latest_decisions': {
      const project = asString(args.project) || 'ceibo-vidal';
      const limit = asNumber(args.limit, 8);
      return { project, decisions: getLatestDecisions(project, limit) };
    }

    case 'get_invoices': {
      return safe(async () => {
        const project = asString(args.project);
        const supplier = asString(args.supplier);
        const status = asString(args.status);
        const limit = asNumber(args.limit, 30);

        const filters = [];
        if (project) filters.push(ilike(invoices.projectRef, `%${project}%`));
        if (supplier) filters.push(ilike(invoices.supplierName, `%${supplier}%`));
        if (status) filters.push(eq(invoices.status, status));

        const rows = await db
          .select()
          .from(invoices)
          .where(filters.length ? and(...filters) : undefined)
          .orderBy(desc(invoices.createdAt))
          .limit(limit);

        const total = rows.reduce((a, r) => a + (r.amount ?? 0), 0);
        return { count: rows.length, totalAmount: total, invoices: rows };
      }, { invoices: [], count: 0 });
    }

    case 'get_payments': {
      return safe(async () => {
        const project = asString(args.project);
        const status = asString(args.status);
        const type = asString(args.type);
        const month = asString(args.month);

        const filters = [];
        if (project) filters.push(ilike(payments.projectRef, `%${project}%`));
        if (status) filters.push(eq(payments.status, status));
        if (type) filters.push(eq(payments.type, type));

        const rows = await db
          .select()
          .from(payments)
          .where(filters.length ? and(...filters) : undefined)
          .orderBy(desc(payments.createdAt));

        const filtered = month
          ? rows.filter((p) => (p.paidDate ?? p.dueDate ?? '').startsWith(month))
          : rows;

        return {
          count: filtered.length,
          totalIngresos: filtered.filter((p) => p.type === 'ingreso').reduce((a, p) => a + p.amount, 0),
          totalEgresos: filtered.filter((p) => p.type === 'egreso').reduce((a, p) => a + p.amount, 0),
          payments: filtered.slice(0, 40),
        };
      }, { payments: [], count: 0 });
    }

    case 'search_documents': {
      return safe(async () => {
        const query = asString(args.query);
        const project = asString(args.project);
        const category = asString(args.category);

        const filters = [];
        if (query) {
          filters.push(
            or(ilike(documents.name, `%${query}%`), ilike(documents.description, `%${query}%`)),
          );
        }
        if (project) filters.push(ilike(documents.projectRef, `%${project}%`));
        if (category) filters.push(eq(documents.category, category));

        let dbDocs: unknown[] = [];
        try {
          dbDocs = await db
            .select({
              id: documents.id,
              name: documents.name,
              category: documents.category,
              projectRef: documents.projectRef,
              folderPath: documents.folderPath,
              driveFileId: documents.driveFileId,
              driveWebViewLink: documents.driveWebViewLink,
              createdAt: documents.createdAt,
            })
            .from(documents)
            .where(filters.length ? and(...filters) : undefined)
            .orderBy(desc(documents.createdAt))
            .limit(30);
        } catch {
          dbDocs = [];
        }

        let driveHits: { driveFileId: string; name: string; webViewLink: string | null; mimeType: string }[] = [];
        try {
          driveHits = (await searchDriveByName(query)).map((f) => ({
            driveFileId: f.id,
            name: f.name,
            webViewLink: f.webViewLink,
            mimeType: f.mimeType,
          }));
        } catch {
          driveHits = [];
        }

        return {
          source: 'postgres + drive',
          linkedDocuments: dbDocs,
          driveFiles: driveHits,
          note: 'linkedDocuments son facturas u otros archivos registrados en la app. driveFiles son coincidencias en la carpeta de Ceibo Vidal. Toda esa carpeta es de este proyecto.',
        };
      }, { linkedDocuments: [], driveFiles: [] });
    }

    case 'read_drive_file': {
      const driveFileId = asString(args.driveFileId);
      if (!driveFileId) return { error: 'Falta driveFileId' };
      const content = await getDriveFileText(driveFileId);
      return content;
    }

    case 'get_units': {
      return safe(async () => {
        const project = asString(args.project) || 'ceibo-vidal';
        const rows = await db
          .select()
          .from(units)
          .where(or(eq(units.projectRef, project), eq(units.projectId, project)));

        const available = rows.filter((u) => u.status === 'disponible').length;
        const sold = rows.filter((u) => u.status === 'vendida').length;
        return {
          project,
          total: rows.length,
          available,
          sold,
          reserved: rows.filter((u) => u.status === 'reservada').length,
          units: rows,
          note:
            rows.length === 0
              ? 'No hay unidades cargadas todavía. No inventar cantidades.'
              : undefined,
        };
      }, { units: [], total: 0, note: 'No hay unidades cargadas todavía.' });
    }

    case 'get_project_financial_summary': {
      const project = asString(args.project) || 'ceibo-vidal';
      const now = new Date();
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      const invoiceData = await runTool('get_invoices', { project, limit: 50 });
      const paymentData = await runTool('get_payments', { project, month });

      let snapshots: unknown[] = [];
      try {
        snapshots = await db
          .select()
          .from(financialSnapshots)
          .orderBy(desc(financialSnapshots.syncedAt))
          .limit(5);
      } catch {
        snapshots = [];
      }

      return {
        project,
        month,
        invoices: invoiceData,
        paymentsThisMonth: paymentData,
        driveSnapshots: snapshots,
        caveat:
          'Si un campo está vacío o en cero, no hay dato cargado. No completar con estimaciones.',
      };
    }

    case 'get_suppliers': {
      return safe(async () => {
        const query = asString(args.query);
        const filter = query
          ? or(
              ilike(contacts.name, `%${query}%`),
              ilike(contacts.company, `%${query}%`),
              ilike(contacts.notes, `%${query}%`),
            )
          : undefined;
        const rows = await db.select().from(contacts).where(filter).limit(40);
        return { count: rows.length, contacts: rows };
      }, { contacts: [] });
    }

    default:
      return { error: `Herramienta desconocida: ${name}` };
  }
}
