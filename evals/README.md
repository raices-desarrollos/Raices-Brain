# Evaluaciones (Evals) — Raíces Brain

Este directorio contiene las evaluaciones de calidad de las respuestas de los agentes de Raíces Brain.

## Propósito

Las evals permiten medir objetivamente qué tan bien responden los agentes a preguntas reales del negocio. Son la base para mejorar el sistema de forma iterativa.

## Estructura

| Carpeta             | Descripción                                        |
| ------------------- | -------------------------------------------------- |
| `questions/`        | Sets de preguntas de evaluación por dominio (JSON) |
| `expected-answers/` | Respuestas esperadas de referencia (Markdown)      |

## Cómo usar las evals

```bash
# Ejecutar todas las evaluaciones
npx tsx scripts/run-evals.ts

# Ejecutar evals de un dominio específico
npx tsx scripts/run-evals.ts --domain ceibo-vidal
```

## Formato de evaluación

Cada pregunta en `questions/` tiene:

- `id` — Identificador único
- `question` — La pregunta en lenguaje natural
- `domain` — Dominio (ceibo-vidal, terrenos, finanzas, marca)
- `agentSlug` — Agente a usar
- `expectedAnswerRef` — Referencia al archivo de respuesta esperada
- `criteria` — Lista de criterios que debe cumplir la respuesta

## Métricas objetivo

| Métrica                                 | Objetivo |
| --------------------------------------- | -------- |
| Respuestas con citas correctas          | > 80%    |
| Respuestas sin alucinaciones            | > 95%    |
| Respuestas en tono correcto (comercial) | > 90%    |
| Respuestas que reconocen incertidumbre  | > 85%    |
