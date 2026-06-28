// MCP Tool: search_knowledge
// Búsqueda semántica en el knowledge base de Raíces Brain

export const searchKnowledge = {
  definition: {
    name: 'search_knowledge',
    description:
      'Busca información relevante en el knowledge base de Raíces Desarrollos usando búsqueda semántica',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'La consulta de búsqueda en lenguaje natural',
        },
        project: {
          type: 'string',
          description: 'Filtrar por proyecto (ej: ceibo-vidal). Opcional.',
        },
        category: {
          type: 'string',
          description: 'Filtrar por categoría (ej: decisions, financials, architecture). Opcional.',
        },
        topK: {
          type: 'number',
          description: 'Número máximo de resultados a retornar (default: 5)',
        },
      },
      required: ['query'],
    },
  },

  handler: async (args: { query: string; project?: string; category?: string; topK?: number }) => {
    // TODO: Implementar usando retrieveDocuments de src/lib/ai/rag.ts
    return {
      content: [
        {
          type: 'text',
          text: `search_knowledge: pendiente de implementación. Query: ${args.query}`,
        },
      ],
    };
  },
};
