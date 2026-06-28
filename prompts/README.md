# Prompts — Raíces Brain

Este directorio contiene los prompts reutilizables y específicos por proyecto de Raíces Desarrollos.

## Estructura

| Carpeta             | Descripción                                               |
| ------------------- | --------------------------------------------------------- |
| `reusable/`         | Prompts genéricos que pueden usarse en cualquier proyecto |
| `project-specific/` | Prompts específicos para un proyecto determinado          |

## Cómo usar los prompts

Los prompts de esta carpeta son instrucciones listas para usar con un modelo de lenguaje. Cada archivo contiene:

- El propósito del prompt
- El prompt en sí (listo para copiar y adaptar)
- Instrucciones de uso y notas

## Diferencia con los prompts de agentes

Los prompts de `agents/*/system-prompt.md` son system prompts para configurar el comportamiento de un agente. Los prompts de esta carpeta son prompts de usuario para tareas específicas.

## Diferencia con los prompts de renders

Los prompts de render de cada proyecto están en `knowledge/projects/*/prompts/` porque son parte del conocimiento específico del proyecto (incluyen materiales, especificaciones, etc.).
