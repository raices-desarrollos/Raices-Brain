// Lógica de dominio — Renders
// Funciones para gestionar los renders de los proyectos

import fs from 'fs';
import path from 'path';

export interface RenderSpec {
  version: string;
  status: string;
  project: string;
  type?: string;
  description?: string;
}

const KNOWLEDGE_DIR = path.join(process.cwd(), 'knowledge');

/**
 * Carga la especificación de render activa de un proyecto.
 * @param projectSlug Slug del proyecto
 */
export function getCurrentRenderSpec(projectSlug: string): RenderSpec | null {
  const specPath = path.join(
    KNOWLEDGE_DIR,
    'projects',
    projectSlug,
    'visual-identity',
    'facade-render-spec.current.json',
  );

  if (!fs.existsSync(specPath)) return null;

  try {
    const content = fs.readFileSync(specPath, 'utf-8');
    return JSON.parse(content) as RenderSpec;
  } catch {
    return null;
  }
}

/**
 * Retorna el índice de renders aprobados de un proyecto.
 * TODO: Implementar lectura del outputs-index.md
 */
export async function getApprovedRenders(projectSlug: string): Promise<string[]> {
  // TODO: Leer y parsear renders/outputs-index.md
  return [];
}
