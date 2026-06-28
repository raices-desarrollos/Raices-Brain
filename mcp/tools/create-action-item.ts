// MCP Tool: create_action_item
// Registra un ítem de acción pendiente en el directorio de tareas del proyecto


export const createActionItem = {
  definition: {
    name: 'create_action_item',
    description:
      'Registra un ítem de acción pendiente en el sistema de tareas de un proyecto de Raíces Desarrollos',
    inputSchema: {
      type: 'object',
      properties: {
        project: {
          type: 'string',
          description: 'Slug del proyecto (ej: ceibo-vidal)',
        },
        action: {
          type: 'string',
          description: 'Descripción de la acción a tomar (verbo en infinitivo)',
        },
        responsible: {
          type: 'string',
          description: 'Nombre o rol del responsable. Opcional.',
        },
        dueDate: {
          type: 'string',
          description: 'Fecha límite en formato YYYY-MM-DD. Opcional.',
        },
        context: {
          type: 'string',
          description: 'Contexto o notas adicionales sobre la tarea. Opcional.',
        },
      },
      required: ['project', 'action'],
    },
  },

  handler: async (args: {
    project: string;
    action: string;
    responsible?: string;
    dueDate?: string;
    context?: string;
  }) => {
    // TODO: Implementar escritura en el directorio tasks/ del proyecto
    // const tasksDir = path.join(process.cwd(), 'knowledge', 'projects', args.project, 'tasks')
    // const date = new Date().toISOString().split('T')[0]
    // const filename = `${date}-${slug(args.action)}.md`
    // fs.writeFileSync(path.join(tasksDir, filename), ...)

    return {
      content: [
        {
          type: 'text',
          text: `create_action_item: pendiente de implementación. Acción: ${args.action}`,
        },
      ],
    };
  },
};
