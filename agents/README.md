# Agentes IA — Raíces Brain

Este directorio define los agentes inteligentes especializados de Raíces Desarrollos.

## Agentes disponibles

| Agente    | Carpeta      | Especialidad                                   |
| --------- | ------------ | ---------------------------------------------- |
| General   | `general/`   | Consultas generales sobre la empresa           |
| Terrenos  | `terrenos/`  | Evaluación y análisis de terrenos              |
| Proyecto  | `proyecto/`  | Gestión y estado de proyectos activos          |
| Finanzas  | `finanzas/`  | Análisis financiero de proyectos               |
| Comercial | `comercial/` | Copy, comunicación y materiales de venta       |
| Legal     | `legal/`     | Resúmenes y alertas legales (no asesoramiento) |

## Estructura de cada agente

Cada carpeta de agente contiene:

- `instructions.md` — qué hace el agente, cuándo usarlo y cómo interactuar con él
- `system-prompt.md` — el system prompt para configurar el agente en el LLM
- Archivos de soporte específicos (rubrica, checklist, tone, etc.)
- `examples.md` — ejemplos de conversaciones de referencia

## Gobernanza

Ver `docs/04-agent-governance.md` para las reglas generales que aplican a todos los agentes.
