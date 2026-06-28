# Guía de Renders — Ceibo Vidal

Criterios y proceso para la generación de renders del proyecto. Es la referencia para el equipo interno y para los estudios de render externos.

## Proceso de un render

1. **Definir el prompt** en `prompts/` (o en `knowledge/projects/ceibo-vidal/prompts/`).
2. **Verificar el spec** en `visual-identity/facade-render-spec.current.json`.
3. **Revisar la paleta** en `visual-identity/material-palette.md`.
4. **Generar exploraciones** → guardar en `renders/explorations/`.
5. **Presentar al equipo** → seleccionar el mejor.
6. **Aprobar** → mover a `renders/approved/` y actualizar `renders/outputs-index.md`.

## Tipos de renders requeridos

| Tipo               | Vista                    | Descripción                    |
| ------------------ | ------------------------ | ------------------------------ |
| Exterior diurno    | Fachada frontal/lateral  | Principal de venta             |
| Exterior hora azul | Fachada con luz interior | Para comunicación aspiracional |
| Exterior nocturno  | Fachada con iluminación  | Para Instagram y web           |
| Interior Apto A    | Living/comedor           | Tipología estándar             |
| Interior Apto B    | Dormitorio principal     | Tipología estándar             |
| Interior Apto C    | Cocina                   | Tipología estándar             |
| Terraza            | Vista terraza del piso 5 | Argumento premium              |

## Entrega esperada

- Formato PNG 4K (principal) + JPG web (secundario)
- Sin marca de agua
- Con y sin personas (el equipo elige cuál publicar)
- Un archivo de composición si se trabaja con software 3D

## Control de versiones de renders

- Todas las versiones generadas se guardan (nunca se borran explorations).
- Solo los aprobados van a `renders/approved/`.
- El índice se mantiene en `renders/outputs-index.md`.
