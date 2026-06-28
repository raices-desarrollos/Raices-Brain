// Lógica de dominio — Decisiones
// Funciones para gestionar el log de decisiones de los proyectos

import fs from 'fs';
import path from 'path';

export interface Decision {
  id: string;
  title: string;
  project: string;
  area: string;
  date: string;
  status: string;
  sourceFile?: string;
}

const KNOWLEDGE_DIR = path.join(process.cwd(), 'knowledge');

/**
 * Lee las decisiones de un proyecto desde el sistema de archivos.
 * @param projectSlug Slug del proyecto
 */
export function getDecisionsFromFiles(projectSlug: string): Decision[] {
  const decisionsDir = path.join(KNOWLEDGE_DIR, 'projects', projectSlug, 'decisions');

  if (!fs.existsSync(decisionsDir)) return [];

  const files = fs.readdirSync(decisionsDir).filter((f) => f.endsWith('.md') && f !== 'README.md');

  return files.map((file) => {
    const filePath = path.join(decisionsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    // Extraer título del primer H1
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].replace('Decisión: ', '') : file.replace('.md', '');

    // Extraer fecha del nombre del archivo (YYYY-MM-DD-...)
    const dateMatch = file.match(/^(\d{4}-\d{2}-\d{2})/);
    const date = dateMatch ? dateMatch[1] : '';

    return {
      id: `${projectSlug}-${file.replace('.md', '')}`,
      title,
      project: projectSlug,
      area: 'general',
      date,
      status: 'approved',
      sourceFile: `knowledge/projects/${projectSlug}/decisions/${file}`,
    };
  });
}

/**
 * Obtiene las últimas N decisiones de un proyecto.
 */
export function getLatestDecisions(projectSlug: string, limit: number = 5): Decision[] {
  const decisions = getDecisionsFromFiles(projectSlug);
  return decisions.sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit);
}
