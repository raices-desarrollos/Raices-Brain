# SKILL: Actualizar Decision Log

**Nombre:** actualizar-decision-log  
**Versión:** 1.0

## Descripción

Esta skill estandariza el registro de decisiones en el formato de Raíces Desarrollos, asegurando que cada decisión quede documentada con su contexto, alternativas y razón.

## Cuándo usar esta skill

- Cuando se toma una decisión importante en un proyecto.
- Al procesar una minuta de reunión donde se tomaron decisiones.
- Para registrar decisiones tomadas informalmente (por chat o conversación).

## Inputs requeridos

| Input        | Descripción                        |
| ------------ | ---------------------------------- |
| La decisión  | Qué se decidió en una oración      |
| Fecha        | Cuándo se tomó                     |
| Contexto     | Por qué se tomó esta decisión      |
| Alternativas | Qué otras opciones se consideraron |
| Proyecto     | A qué proyecto pertenece           |

## Proceso

1. Reunir los datos de la decisión.
2. Completar el template de decisión (`decision-template.md`).
3. Nombrar el archivo: `YYYY-MM-DD-[descripcion-breve].md`
4. Guardar en `knowledge/projects/[proyecto]/decisions/` o en `knowledge/company/operations/decision-log/`.

## Output esperado

Un archivo Markdown con la decisión documentada en el formato estándar.

## Archivos relacionados

- `decision-template.md` — Template de decisión
