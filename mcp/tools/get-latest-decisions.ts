// MCP Tool: get_latest_decisions
// Obtiene las últimas decisiones registradas de un proyecto

export const getLatestDecisions = {
  definition: {
    name: 'get_latest_decisions',
    description: 'Obtiene las últimas decisiones registradas de un proyecto de Raíces Desarrollos',
    inputSchema: {
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
  },

  handler: async (args: { project: string; limit?: number }) => {
    // TODO: Implementar usando getLatestDecisions de src/lib/domain/decisions.ts
    return {
      content: [
        {
          type: 'text',
          text: `get_latest_decisions: pendiente de implementación. Proyecto: ${args.project}`,
        },
      ],
    };
  },
};
