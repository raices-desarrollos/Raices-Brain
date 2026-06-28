# SKILL: Evaluar Terreno

**Nombre:** evaluar-terreno  
**Versión:** 1.0  
**Agente principal:** `agents/terrenos/`

## Descripción

Esta skill guía el proceso completo de evaluación de un terreno candidato para un nuevo proyecto de Raíces Desarrollos. Produce un análisis estructurado con puntaje, puntos fuertes, riesgos y recomendación.

## Cuándo usar esta skill

- Cuando se identifica un terreno candidato y se quiere una primera evaluación.
- Antes de presentar un terreno al equipo para decidir si avanzar.
- Para documentar formalmente la evaluación en el pipeline de terrenos.

## Inputs requeridos

| Input                     | Obligatorio | Descripción                             |
| ------------------------- | ----------- | --------------------------------------- |
| Dirección                 | Sí          | Calle, número y barrio                  |
| Superficie (m²)           | Sí          | Total y frente/fondo si está disponible |
| Precio pedido (USD)       | Sí          | Precio pedido por el vendedor           |
| Zonificación              | Recomendado | Clasificación normativa del terreno     |
| Situación dominial        | Recomendado | Estado del título, hipotecas, etc.      |
| Observaciones del entorno | Opcional    | Descripción del barrio y la calle       |

## Proceso

1. Recopilar los inputs disponibles.
2. Aplicar la rúbrica de evaluación (`agents/terrenos/evaluation-rubric.md`).
3. Completar el template (`knowledge/terrains/templates/terrain-evaluation-template.md`).
4. Generar el resumen ejecutivo (`knowledge/terrains/templates/terrain-summary-template.md`).
5. Guardar en `knowledge/terrains/pipeline/[slug-del-terreno].md`.

## Output esperado

- Evaluación completa según el template estándar.
- Puntaje ponderado sobre 100.
- Recomendación clara: Avanzar / En espera / Descartar.

## Archivos relacionados

- `criteria.md` — Criterios de evaluación en detalle
- `examples.md` — Ejemplos de evaluaciones completas
