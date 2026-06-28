// MCP Tool: list_terrains
// Lista el pipeline de terrenos en evaluación

export const listTerrains = {
  definition: {
    name: 'list_terrains',
    description: 'Lista los terrenos en el pipeline de evaluación de Raíces Desarrollos',
    inputSchema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'Filtrar por estado: pipeline | evaluated | rejected. Opcional.',
          enum: ['pipeline', 'evaluated', 'rejected'],
        },
      },
    },
  },

  handler: async (args: { status?: string }) => {
    // TODO: Implementar usando getTerrainPipeline de src/lib/domain/terrains.ts
    return {
      content: [
        {
          type: 'text',
          text: `list_terrains: pendiente de implementación. Status filter: ${args.status ?? 'all'}`,
        },
      ],
    };
  },
};
