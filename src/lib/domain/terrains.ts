// Lógica de dominio — Terrenos
// Funciones de negocio para el pipeline de terrenos

export interface Terrain {
  id: string;
  address: string;
  neighborhood?: string;
  status: string;
  evaluation?: { score?: number; recommendation?: string };
  createdAt: Date;
}

/**
 * Obtiene todos los terrenos en el pipeline activo.
 * TODO: Implementar con consulta a la base de datos
 */
export async function getTerrainPipeline(): Promise<Terrain[]> {
  // TODO: Consultar terrains con status 'pipeline' o 'evaluated'
  return [];
}

/**
 * Retorna el resumen del pipeline de terrenos para los agentes.
 * TODO: Implementar con datos reales
 */
export async function getTerrainPipelineSummary(): Promise<{
  total: number;
  inPipeline: number;
  evaluated: number;
  rejected: number;
}> {
  return { total: 0, inPipeline: 0, evaluated: 0, rejected: 0 };
}
