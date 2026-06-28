# SKILL: Crear Minuta de Reunión

**Nombre:** crear-minuta-reunion  
**Versión:** 1.0

## Descripción

Esta skill genera minutas de reunión estructuradas a partir de notas o transcripciones, en el formato estándar de Raíces Desarrollos.

## Cuándo usar esta skill

- Después de cada reunión importante del equipo.
- Para documentar llamadas con el arquitecto, escribano, constructora u otros proveedores.
- Para registrar conversaciones donde se tomaron decisiones que deben quedar documentadas.

## Inputs requeridos

| Input                 | Descripción                      |
| --------------------- | -------------------------------- |
| Notas o transcripción | El texto base de la reunión      |
| Fecha                 | Cuándo fue la reunión            |
| Participantes         | Quiénes estuvieron               |
| Proyecto o contexto   | A qué proyecto o tema se refiere |

## Proceso

1. Recopilar las notas o transcripción de la reunión.
2. Usar el prompt `prompts/reusable/create-meeting-minutes.md`.
3. Revisar y completar la minuta generada.
4. Guardar en el directorio correspondiente.

## Dónde guardar la minuta

- Reuniones de proyecto → `knowledge/projects/[proyecto]/meetings/YYYY-MM-DD-[tema].md`
- Reuniones de empresa → `knowledge/company/operations/meeting-notes/YYYY-MM-DD-[tema].md`

## Output esperado

Minuta en formato Markdown con: temas tratados, decisiones tomadas, compromisos y próximos pasos.

## Archivos relacionados

- `template.md` — Template de minuta
- `examples.md` — Ejemplos de minutas completas
