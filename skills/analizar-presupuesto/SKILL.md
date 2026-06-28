# SKILL: Analizar Presupuesto

**Nombre:** analizar-presupuesto  
**Versión:** 1.0  
**Agente principal:** `agents/finanzas/`

## Descripción

Esta skill guía el análisis de presupuestos de proyectos inmobiliarios: identifica los ítems principales, detecta ausencias o inconsistencias, y genera un resumen ejecutivo con alertas.

## Cuándo usar esta skill

- Cuando se recibe un presupuesto de obra para revisar.
- Para comparar el presupuesto actual con los supuestos del modelo financiero.
- Para preparar preguntas al constructor o al contador antes de cerrar un acuerdo.
- Para generar el resumen de presupuesto para el reporte de socios.

## Inputs requeridos

| Input                 | Descripción                                                               |
| --------------------- | ------------------------------------------------------------------------- |
| Presupuesto           | El documento o tabla de presupuesto a analizar                            |
| Supuestos del modelo  | Los supuestos financieros del proyecto (`financials/cost-assumptions.md`) |
| Contexto del proyecto | Proyecto al que pertenece el presupuesto                                  |

## Proceso

1. Revisar el presupuesto con el checklist de esta skill.
2. Identificar ítems faltantes o inconsistentes.
3. Comparar con los supuestos del modelo financiero.
4. Generar resumen con alertas y preguntas para el proveedor.

## Output esperado

- Tabla de análisis por categoría de costo.
- Lista de alertas (ítems faltantes, precios fuera de rango, inconsistencias).
- Preguntas recomendadas para el proveedor.

## Archivos relacionados

- `cost-categories.md` — Categorías estándar de costos
- `checklist.md` — Checklist de revisión de presupuestos
