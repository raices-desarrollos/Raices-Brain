import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';
import {
  PROJECT_CATALOG,
  PROJECT_STATUS_LABEL,
  type ProjectCatalogEntry,
  getCatalogProject,
} from '@/lib/domain/catalog';
import { eq } from 'drizzle-orm';

export type ProjectRecord = ProjectCatalogEntry & { id: string };

function fromCatalog(entry: ProjectCatalogEntry, id?: string): ProjectRecord {
  return { ...entry, id: id ?? entry.slug };
}

export async function listProjects(): Promise<ProjectRecord[]> {
  try {
    const rows = await db.select().from(projects);
    if (rows.length > 0) {
      return rows.map((r) => ({
        id: r.id,
        slug: r.slug,
        name: r.name,
        address: r.address ?? '',
        neighborhood: r.neighborhood,
        city: r.city ?? '',
        status: (r.status as ProjectRecord['status']) ?? 'design',
        statusLabel: PROJECT_STATUS_LABEL[(r.status as ProjectRecord['status']) ?? 'design'] ?? r.status,
        floorsDescription: r.floorsDescription ?? '',
        notes: r.notes,
      }));
    }
  } catch {
    // tabla aún no migrada
  }
  return PROJECT_CATALOG.map((p) => fromCatalog(p));
}

export async function getProjectBySlug(slug: string): Promise<ProjectRecord | null> {
  try {
    const [row] = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
    if (row) {
      return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        address: row.address ?? '',
        neighborhood: row.neighborhood,
        city: row.city ?? '',
        status: (row.status as ProjectRecord['status']) ?? 'design',
        statusLabel:
          PROJECT_STATUS_LABEL[(row.status as ProjectRecord['status']) ?? 'design'] ?? row.status,
        floorsDescription: row.floorsDescription ?? '',
        notes: row.notes,
      };
    }
  } catch {
    // ignore
  }
  const catalog = getCatalogProject(slug);
  return catalog ? fromCatalog(catalog) : null;
}

export async function getActiveProjects(): Promise<ProjectRecord[]> {
  return listProjects();
}
