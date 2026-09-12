import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';
import {
  PROJECT_CATALOG,
  PROJECT_STATUS_LABEL,
  type ProjectCatalogEntry,
  getCatalogProject,
} from '@/lib/domain/catalog';
import {
  getProjectSnapshot,
  getStage,
  writeStoredStage,
  type StageSnapshot,
} from '@/lib/domain/stages';
import { eq } from 'drizzle-orm';

export type ProjectRecord = ProjectCatalogEntry & {
  id: string;
  stage: StageSnapshot;
};

async function withStage(
  entry: ProjectCatalogEntry,
  id: string,
  stored?: string | null,
): Promise<ProjectRecord> {
  const stage = await getProjectSnapshot(entry.slug, stored);
  return {
    ...entry,
    id,
    status: stage.phase.id,
    statusLabel: stage.current.label,
    stage,
  };
}

export async function listProjects(): Promise<ProjectRecord[]> {
  try {
    const rows = await db.select().from(projects);
    if (rows.length > 0) {
      return Promise.all(
        rows.map((r) =>
          withStage(
            {
              slug: r.slug,
              name: r.name,
              address: r.address ?? '',
              neighborhood: r.neighborhood,
              city: r.city ?? '',
              status: (r.status as ProjectCatalogEntry['status']) ?? 'permits',
              statusLabel:
                PROJECT_STATUS_LABEL[(r.status as ProjectCatalogEntry['status']) ?? 'permits'] ??
                r.status,
              floorsDescription: r.floorsDescription ?? '',
              notes: r.notes,
            },
            r.id,
            r.status,
          ),
        ),
      );
    }
  } catch {
    // tabla aún no migrada
  }
  return Promise.all(PROJECT_CATALOG.map((p) => withStage(p, p.slug)));
}

export async function getProjectBySlug(slug: string): Promise<ProjectRecord | null> {
  try {
    const [row] = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
    if (row) {
      return withStage(
        {
          slug: row.slug,
          name: row.name,
          address: row.address ?? '',
          neighborhood: row.neighborhood,
          city: row.city ?? '',
          status: (row.status as ProjectCatalogEntry['status']) ?? 'permits',
          statusLabel:
            PROJECT_STATUS_LABEL[(row.status as ProjectCatalogEntry['status']) ?? 'permits'] ??
            row.status,
          floorsDescription: row.floorsDescription ?? '',
          notes: row.notes,
        },
        row.id,
        row.status,
      );
    }
  } catch {
    // ignore
  }
  const catalog = getCatalogProject(slug);
  return catalog ? withStage(catalog, catalog.slug) : null;
}

export async function getActiveProjects(): Promise<ProjectRecord[]> {
  return listProjects();
}

export async function setProjectStage(slug: string, stageId: string): Promise<ProjectRecord | null> {
  if (!getStage(stageId)) return null;

  await writeStoredStage(slug, stageId);

  try {
    await db.update(projects).set({ status: stageId }).where(eq(projects.slug, slug));
  } catch {
    // si la tabla no está, el archivo alcanza
  }

  return getProjectBySlug(slug);
}
