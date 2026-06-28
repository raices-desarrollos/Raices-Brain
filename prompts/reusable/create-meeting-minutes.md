# Prompt: Crear minuta de reunión

**Uso:** Generar una minuta estructurada a partir de notas o transcripción de una reunión.

## Prompt

```
Generá una minuta de reunión formal basada en las siguientes notas o transcripción.

La minuta debe tener este formato:

---
# Minuta de Reunión — [Nombre del proyecto o tema]

**Fecha:** [Fecha]
**Participantes:** [Lista de participantes]
**Objetivo de la reunión:** [En una línea]

## Temas tratados
[Lista numerada de temas discutidos]

## Decisiones tomadas
[Lista de decisiones con contexto]

## Compromisos y próximos pasos
| Acción | Responsable | Fecha límite |
|--------|-------------|-------------|
| ... | ... | ... |

## Próxima reunión
[Fecha y objetivo si se acordó]
---

NOTAS O TRANSCRIPCIÓN:
[Pegar las notas aquí]
```

## Instrucciones de uso

1. Pegar las notas de la reunión o la transcripción.
2. Completar los datos que el modelo no puede inferir (participantes, fecha).
3. La minuta generada va a `knowledge/projects/[proyecto]/meetings/` con el formato `YYYY-MM-DD-[tema].md`.

## Notas

- Para reuniones de empresa general, guardar en `knowledge/company/operations/meeting-notes/`.
- Revisar siempre la minuta antes de compartirla: el modelo puede omitir matices.
