// Lógica de dominio — Proyectos inmobiliarios
// Funciones de negocio para gestionar proyectos de Raíces Desarrollos

export interface Project {
  id: string;
  slug: string;
  name: string;
  status: string;
  location?: { neighborhood?: string; city?: string };
  program?: { floors?: number; units?: number };
  createdAt: Date;
}

/**
 * Obtiene un proyecto por su slug.
 * TODO: Implementar con consulta a la base de datos
 */
export async function getProjectBySlug(slug: string): Promise<Project | null> {
  // Placeholder: leer del seed mientras no hay base de datos
  const { projects } = await import('../../../data/seed/projects.seed.json');
  const project = projects.find((p: { slug: string }) => p.slug === slug);
  if (!project) return null;

  return {
    id: project.id,
    slug: project.slug,
    name: project.name,
    status: project.status,
    createdAt: new Date(project.createdAt),
  };
}

/**
 * Retorna todos los proyectos activos.
 * TODO: Implementar con consulta a la base de datos
 */
export async function getActiveProjects(): Promise<Project[]> {
  const { projects } = await import('../../../data/seed/projects.seed.json');
  return projects.map((p: Record<string, unknown>) => ({
    id: p.id as string,
    slug: p.slug as string,
    name: p.name as string,
    status: p.status as string,
    createdAt: new Date(p.createdAt as string),
  }));
}
