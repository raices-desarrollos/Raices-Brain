# Skills — Raíces Brain

Este directorio contiene las skills modulares que los agentes de Raíces Brain pueden usar para tareas específicas y repetibles.

## Estructura

Cada skill tiene su propia carpeta con:

- `SKILL.md` — Descripción de la skill, cuándo usarla y cómo invocarla
- Archivos de soporte (templates, criteria, examples, etc.)

## Skills disponibles

| Skill                      | Carpeta                    | Descripción                                            |
| -------------------------- | -------------------------- | ------------------------------------------------------ |
| Evaluar terreno            | `evaluar-terreno/`         | Proceso completo de evaluación de un terreno candidato |
| Crear minuta de reunión    | `crear-minuta-reunion/`    | Generación de minutas estructuradas                    |
| Analizar presupuesto       | `analizar-presupuesto/`    | Análisis de presupuestos de proyectos                  |
| Actualizar decision log    | `actualizar-decision-log/` | Registro de decisiones en el formato estándar          |
| Preparar reporte de socios | `preparar-reporte-socios/` | Update periódico para socios e inversores              |
| Redactar mail Raíces       | `redactar-mail-raices/`    | Emails en el tono de marca de Raíces                   |

## Cómo invocar una skill

En el contexto de un agente: "Usá la skill `[nombre]` para [tarea]."

En uso directo: abrir el `SKILL.md` de la skill y seguir las instrucciones.
