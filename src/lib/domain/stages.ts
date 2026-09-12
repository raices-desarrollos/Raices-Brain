import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

/**
 * Recorrido del edificio. La venta no es una fase: corre en paralelo desde
 * ahora hasta la entrega. Acá solo está “dónde está parado el proyecto”.
 */

export type PhaseId = 'design' | 'permits' | 'construction' | 'delivery';

export type Stage = {
  id: string;
  label: string;
  phaseId: PhaseId;
};

export type Phase = {
  id: PhaseId;
  label: string;
  stages: Stage[];
};

export const PHASES: Phase[] = [
  {
    id: 'design',
    label: 'Diseño',
    stages: [
      { id: 'terreno', label: 'Terreno', phaseId: 'design' },
      { id: 'anteproyecto', label: 'Anteproyecto', phaseId: 'design' },
      { id: 'proyecto-ejecutivo', label: 'Proyecto ejecutivo', phaseId: 'design' },
    ],
  },
  {
    id: 'permits',
    label: 'Permisos',
    stages: [
      { id: 'planos-municipalidad', label: 'Aprobación de planos', phaseId: 'permits' },
      { id: 'permiso-obra', label: 'Permiso de obra', phaseId: 'permits' },
    ],
  },
  {
    id: 'construction',
    label: 'Obra',
    stages: [
      { id: 'inicio-obra', label: 'Inicio de obra', phaseId: 'construction' },
      { id: 'estructura', label: 'Estructura', phaseId: 'construction' },
      { id: 'cerramientos', label: 'Cerramientos', phaseId: 'construction' },
      { id: 'instalaciones', label: 'Instalaciones', phaseId: 'construction' },
      { id: 'terminaciones', label: 'Terminaciones', phaseId: 'construction' },
      { id: 'final-obra', label: 'Final de obra', phaseId: 'construction' },
    ],
  },
  {
    id: 'delivery',
    label: 'Entrega',
    stages: [{ id: 'posesion', label: 'Posesión', phaseId: 'delivery' }],
  },
];

export const STAGES: Stage[] = PHASES.flatMap((phase) => phase.stages);

const STAGE_BY_ID = new Map(STAGES.map((stage) => [stage.id, stage]));
const PHASE_BY_ID = new Map(PHASES.map((phase) => [phase.id, phase]));

/** Por defecto Ceibo Vidal está en aprobación de planos. */
export const DEFAULT_STAGE_BY_SLUG: Record<string, string> = {
  'ceibo-vidal': 'planos-municipalidad',
};

export type StageState = 'done' | 'current' | 'upcoming';

export type StageSnapshot = {
  currentId: string;
  current: Stage;
  phase: Phase;
  /** Índice 0-based en el recorrido completo. */
  index: number;
  progress: number;
  stages: Array<Stage & { state: StageState }>;
  phases: Array<Phase & { state: StageState; stages: Array<Stage & { state: StageState }> }>;
};

export function getStage(id: string): Stage | null {
  return STAGE_BY_ID.get(id) ?? null;
}

/** Acepta un id de etapa o el de una fase vieja (`design`, `permits`, …). */
export function resolveStageId(stored: string | null | undefined, slug?: string): string {
  if (stored && STAGE_BY_ID.has(stored)) return stored;
  if (stored && PHASE_BY_ID.has(stored as PhaseId)) {
    return PHASE_BY_ID.get(stored as PhaseId)!.stages[0].id;
  }
  if (slug && DEFAULT_STAGE_BY_SLUG[slug]) return DEFAULT_STAGE_BY_SLUG[slug];
  return STAGES[0].id;
}

export function buildSnapshot(currentId: string): StageSnapshot {
  const id = STAGE_BY_ID.has(currentId) ? currentId : STAGES[0].id;
  const index = STAGES.findIndex((stage) => stage.id === id);
  const current = STAGES[index];
  const phase = PHASE_BY_ID.get(current.phaseId)!;

  const stages = STAGES.map((stage, i) => ({
    ...stage,
    state: (i < index ? 'done' : i === index ? 'current' : 'upcoming') as StageState,
  }));

  const phases = PHASES.map((item) => {
    const withState = item.stages.map((stage) => stages.find((s) => s.id === stage.id)!);
    const state: StageState = withState.some((s) => s.state === 'current')
      ? 'current'
      : withState.every((s) => s.state === 'done')
        ? 'done'
        : 'upcoming';
    return { ...item, state, stages: withState };
  });

  return {
    currentId: id,
    current,
    phase,
    index,
    progress: STAGES.length > 1 ? index / (STAGES.length - 1) : 1,
    stages,
    phases,
  };
}

function stageFile(slug: string): string | null {
  if (!/^[a-z0-9-]+$/i.test(slug)) return null;
  return path.join(process.cwd(), 'knowledge', 'projects', slug, 'stage.json');
}

export async function readStoredStage(slug: string): Promise<string | null> {
  const file = stageFile(slug);
  if (!file) return null;
  try {
    const raw = JSON.parse(await readFile(file, 'utf8')) as { stageId?: string };
    return raw.stageId && STAGE_BY_ID.has(raw.stageId) ? raw.stageId : null;
  } catch {
    return null;
  }
}

export async function writeStoredStage(slug: string, stageId: string): Promise<void> {
  const file = stageFile(slug);
  if (!file) throw new Error('Proyecto inválido.');
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(
    file,
    `${JSON.stringify({ stageId, updatedAt: new Date().toISOString() }, null, 2)}\n`,
    'utf8',
  );
}

export async function getProjectSnapshot(
  slug: string,
  stored?: string | null,
): Promise<StageSnapshot> {
  const fromFile = stored && STAGE_BY_ID.has(stored) ? stored : await readStoredStage(slug);
  return buildSnapshot(resolveStageId(fromFile ?? stored, slug));
}
