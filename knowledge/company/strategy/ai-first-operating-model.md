# Modelo Operativo AI-First — Raíces Desarrollos

Define cómo Raíces integra la inteligencia artificial en su operación cotidiana.

## Principio

Raíces no usa IA como herramienta ocasional: la IA es parte del flujo de trabajo estándar. Cada proceso tiene un agente o prompt asociado que amplifica la capacidad del equipo humano.

## Procesos con IA integrada

| Proceso                 | Herramienta IA               | Agente / Skill                    |
| ----------------------- | ---------------------------- | --------------------------------- |
| Evaluación de terrenos  | Agente con rubrica           | `agents/terrenos/`                |
| Análisis de proyecto    | Agente con contexto completo | `agents/proyecto/`                |
| Minutas de reunión      | Skill de resumen             | `skills/crear-minuta-reunion/`    |
| Análisis de presupuesto | Skill de análisis            | `skills/analizar-presupuesto/`    |
| Log de decisiones       | Skill de registro            | `skills/actualizar-decision-log/` |
| Generación de renders   | Prompts especializados       | `prompts/project-specific/`       |
| Reporte a socios        | Skill de reporte             | `skills/preparar-reporte-socios/` |
| Comunicaciones externas | Skill de redacción           | `skills/redactar-mail-raices/`    |

## Lo que NO delegamos a la IA

- Decisiones de inversión finales.
- Firma de contratos o compromisos legales.
- Comunicaciones con compradores sobre precios o términos.
- Cualquier acción que requiera discreción o juicio relacional.

## Flujo de trabajo estándar

1. El equipo genera conocimiento (reuniones, decisiones, documentos).
2. El conocimiento se indexa en Raíces Brain.
3. Los agentes tienen acceso a ese conocimiento actualizado.
4. El equipo consulta a los agentes para acelerar procesos.
5. Los outputs de los agentes son revisados y aprobados por humanos.
