// Tools disponibles para los agentes (Function Calling / Tool Use)
// Define las herramientas que los agentes pueden invocar

export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

/**
 * Tool: Buscar en el knowledge base
 * Permite al agente hacer búsquedas semánticas adicionales durante la conversación.
 */
export const searchKnowledgeTool: Tool = {
  name: 'search_knowledge',
  description: 'Busca información relevante en el knowledge base de Raíces Desarrollos',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'La consulta de búsqueda',
      },
      project: {
        type: 'string',
        description: 'Filtrar por proyecto (ej: ceibo-vidal)',
      },
      category: {
        type: 'string',
        description: 'Filtrar por categoría (ej: decisions, financials, architecture)',
      },
    },
    required: ['query'],
  },
};

/**
 * Tool: Obtener las últimas decisiones de un proyecto
 */
export const getLatestDecisionsTool: Tool = {
  name: 'get_latest_decisions',
  description: 'Obtiene las últimas decisiones registradas de un proyecto',
  parameters: {
    type: 'object',
    properties: {
      project: {
        type: 'string',
        description: 'Slug del proyecto (ej: ceibo-vidal)',
      },
      limit: {
        type: 'number',
        description: 'Número máximo de decisiones a retornar (default: 5)',
      },
    },
    required: ['project'],
  },
};

// TODO: Agregar más tools a medida que se implementen las funcionalidades
export const allTools: Tool[] = [searchKnowledgeTool, getLatestDecisionsTool];
