# Terrenos

Este directorio centraliza el pipeline de evaluación y seguimiento de terrenos candidatos para nuevos proyectos de Raíces Desarrollos.

## Estructura

| Carpeta      | Descripción                                                 |
| ------------ | ----------------------------------------------------------- |
| `pipeline/`  | Terrenos en análisis activo                                 |
| `evaluated/` | Terrenos evaluados con decisión tomada (seguir o descartar) |
| `rejected/`  | Terrenos descartados con razón documentada                  |
| `templates/` | Templates para evaluar y resumir terrenos                   |

## Proceso de evaluación

1. **Ingreso al pipeline** — se crea un archivo en `pipeline/` con el template de evaluación.
2. **Análisis** — el agente `terrenos` asiste en la evaluación usando `agents/terrenos/evaluation-rubric.md`.
3. **Decisión** — el equipo decide si seguir o descartar.
4. **Archivo** — el documento pasa a `evaluated/` o `rejected/` con la decisión documentada.

## Criterios generales

Ver `criteria.md` para los criterios de evaluación de terrenos de Raíces Desarrollos.
