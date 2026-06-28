// Lógica de dominio — Proveedores
// Funciones de negocio para la red de proveedores

export interface Provider {
  id: string;
  name: string;
  type: string;
  status: string;
  rating?: number;
  projects?: string[];
}

/**
 * Obtiene proveedores por tipo.
 * TODO: Implementar con consulta a la base de datos
 */
export async function getProvidersByType(type: string): Promise<Provider[]> {
  // TODO: Consultar providers filtrado por type
  return [];
}

/**
 * Obtiene los proveedores que trabajaron en un proyecto específico.
 * TODO: Implementar con consulta a la base de datos
 */
export async function getProvidersByProject(projectSlug: string): Promise<Provider[]> {
  // TODO: Consultar providers donde projects incluye projectSlug
  return [];
}
