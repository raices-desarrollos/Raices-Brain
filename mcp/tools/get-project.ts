// MCP Tool: get_project
// Obtiene los datos completos de un proyecto de Raíces Desarrollos

export const getProject = {
  definition: {
    name: 'get_project',
    description:
      'Obtiene los datos y el estado actual de un proyecto inmobiliario de Raíces Desarrollos',
    inputSchema: {
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          description: 'Slug del proyecto (ej: ceibo-vidal)',
        },
      },
      required: ['slug'],
    },
  },

  handler: async (args: { slug: string }) => {
    // TODO: Implementar usando getProjectBySlug de src/lib/domain/projects.ts
    return {
      content: [
        {
          type: 'text',
          text: `get_project: pendiente de implementación. Slug: ${args.slug}`,
        },
      ],
    };
  },
};
