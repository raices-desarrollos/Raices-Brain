import type OpenAI from 'openai';

export const BRAIN_TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'search_knowledge',
      description:
        'Busca en el knowledge base interno (briefs, decisiones, arquitectura, finanzas). Usar para preguntas de contexto institucional.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Consulta de búsqueda' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_project',
      description: 'Obtiene datos estructurados de un proyecto (nombre, dirección, estado).',
      parameters: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Slug, ej: ceibo-vidal' },
        },
        required: ['slug'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_latest_decisions',
      description: 'Últimas decisiones registradas de un proyecto, desde archivos de knowledge.',
      parameters: {
        type: 'object',
        properties: {
          project: { type: 'string', description: 'Slug del proyecto' },
          limit: { type: 'number' },
        },
        required: ['project'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_invoices',
      description: 'Lista facturas de la base de datos. Filtrar por proyecto, proveedor o estado.',
      parameters: {
        type: 'object',
        properties: {
          project: { type: 'string' },
          supplier: { type: 'string' },
          status: { type: 'string', description: 'pendiente | pagada | parcial | anulada' },
          limit: { type: 'number' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_payments',
      description: 'Lista pagos (ingresos/egresos) registrados.',
      parameters: {
        type: 'object',
        properties: {
          project: { type: 'string' },
          status: { type: 'string' },
          type: { type: 'string', description: 'ingreso | egreso' },
          month: { type: 'string', description: 'YYYY-MM para filtrar por mes de pago o vencimiento' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_documents',
      description:
        'Busca documentos en Postgres (vinculados) y en Google Drive por nombre. Usar para planos, carpinterías, facturas, etc.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          project: { type: 'string' },
          category: { type: 'string' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'read_drive_file',
      description:
        'Lee el contenido de un archivo de Drive (Google Doc o PDF con texto). Requiere driveFileId.',
      parameters: {
        type: 'object',
        properties: {
          driveFileId: { type: 'string' },
        },
        required: ['driveFileId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_units',
      description: 'Unidades de un proyecto (disponibles, reservadas, vendidas).',
      parameters: {
        type: 'object',
        properties: {
          project: { type: 'string' },
        },
        required: ['project'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_project_financial_summary',
      description:
        'Resumen financiero: facturas, pagos del mes y snapshots de Drive si existen. No inventa números.',
      parameters: {
        type: 'object',
        properties: {
          project: { type: 'string' },
        },
        required: ['project'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_suppliers',
      description: 'Contactos/proveedores registrados (categoría proveedor u otras).',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string' },
        },
      },
    },
  },
];
