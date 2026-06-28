// Control de acceso y permisos de los agentes
// Define qué puede leer cada agente según el modelo de seguridad

export type UserRole = 'admin' | 'team' | 'investor' | 'buyer' | 'public';
export type AgentSlug = 'general' | 'terrenos' | 'proyecto' | 'finanzas' | 'comercial' | 'legal';
export type DocumentCategory =
  | 'identity'
  | 'strategy'
  | 'operations'
  | 'legal'
  | 'finance'
  | 'commercial'
  | 'architecture'
  | 'renders'
  | 'decisions'
  | 'providers'
  | 'terrains';

interface AgentPermissions {
  allowedCategories: DocumentCategory[];
  allowedProjects: string[] | 'all';
  canReadConfidential: boolean;
}

// Define qué categorías puede leer cada agente
const AGENT_PERMISSIONS: Record<AgentSlug, AgentPermissions> = {
  general: {
    allowedCategories: ['identity', 'strategy', 'decisions', 'architecture', 'renders'],
    allowedProjects: 'all',
    canReadConfidential: false,
  },
  terrenos: {
    allowedCategories: ['terrains', 'strategy', 'decisions'],
    allowedProjects: 'all',
    canReadConfidential: false,
  },
  proyecto: {
    allowedCategories: ['architecture', 'decisions', 'commercial', 'renders', 'operations'],
    allowedProjects: 'all',
    canReadConfidential: false,
  },
  finanzas: {
    allowedCategories: ['finance', 'strategy', 'decisions'],
    allowedProjects: 'all',
    canReadConfidential: true, // Puede leer finanzas confidenciales
  },
  comercial: {
    allowedCategories: ['commercial', 'renders', 'identity', 'architecture'],
    allowedProjects: 'all',
    canReadConfidential: false,
  },
  legal: {
    allowedCategories: ['legal', 'decisions', 'operations'],
    allowedProjects: 'all',
    canReadConfidential: false, // Solo resúmenes, no documentos originales
  },
};

/**
 * Verifica si un agente puede acceder a un documento con una categoría determinada.
 */
export function canAgentAccessDocument(
  agentSlug: AgentSlug,
  category: DocumentCategory,
  isConfidential: boolean,
): boolean {
  const permissions = AGENT_PERMISSIONS[agentSlug];
  if (!permissions) return false;

  if (isConfidential && !permissions.canReadConfidential) return false;

  return permissions.allowedCategories.includes(category);
}

/**
 * Retorna los filtros de categoría para las búsquedas vectoriales de un agente.
 */
export function getAgentCategoryFilters(agentSlug: AgentSlug): DocumentCategory[] {
  return AGENT_PERMISSIONS[agentSlug]?.allowedCategories ?? [];
}
