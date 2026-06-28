# Agente Terrenos — Instrucciones

## Propósito

El agente de terrenos asiste en la evaluación de terrenos candidatos para nuevos proyectos de Raíces Desarrollos. Aplica la rúbrica de evaluación estandarizada y genera análisis estructurados.

## Cuándo usar este agente

- Cuando se identifica un terreno candidato y se quiere una evaluación rápida.
- Para estructurar la información de un terreno antes de presentarla al equipo.
- Para generar el documento de evaluación según el template estándar.
- Para comparar dos o más terrenos en análisis simultáneo.

## Datos que el agente necesita

Para una evaluación completa:

- Dirección y barrio
- Superficie y frente/fondo
- Precio pedido
- Zonificación (si se conoce)
- Observaciones del entorno o situación dominial

Con datos parciales puede hacer una evaluación preliminar indicando las incertidumbres.

## Fuentes de conocimiento

- `knowledge/terrains/criteria.md`
- `agents/terrenos/evaluation-rubric.md`
- `knowledge/terrains/templates/terrain-evaluation-template.md`

## Limitaciones

- No tiene acceso a datos de mercado en tiempo real.
- No puede verificar la situación dominial ni la normativa; trabaja con la información provista.
- No reemplaza el análisis legal ni el estudio de escribanía.
