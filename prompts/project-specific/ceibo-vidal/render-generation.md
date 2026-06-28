# Prompt específico: Generación de renders — Ceibo Vidal

**Proyecto:** Ceibo Vidal  
**Uso:** Referencia centralizada para la generación de todos los renders del proyecto.

## Instrucciones

Los prompts de render específicos para cada vista están en `knowledge/projects/ceibo-vidal/prompts/`:

| Vista                                  | Archivo                          |
| -------------------------------------- | -------------------------------- |
| Exterior diurno (principal)            | `exterior-render-main.md`        |
| Exterior hora azul                     | `exterior-render-blue-hour.md`   |
| Exterior nocturno                      | `exterior-render-night.md`       |
| Interior — Departamento A (living)     | `interior-render-apartment-a.md` |
| Interior — Departamento B (dormitorio) | `interior-render-apartment-b.md` |
| Interior — Departamento C (cocina)     | `interior-render-apartment-c.md` |
| Terraza (piso 5)                       | `rooftop-render.md`              |

## Antes de usar cualquier prompt de render

1. Verificar que `visual-identity/material-palette.md` tenga los materiales reales confirmados.
2. Revisar `visual-identity/facade-render-spec.current.json` para asegurarse de que está actualizado.
3. Seguir el proceso definido en `visual-identity/render-guidelines.md`.

## Proceso

1. Copiar el prompt del archivo correspondiente.
2. Reemplazar los placeholders de materiales con los valores confirmados.
3. Generar en el sistema de render elegido.
4. Guardar resultado en `renders/explorations/`.
5. Presentar al equipo para aprobación.
6. Si aprobado: mover a `renders/approved/` y actualizar `renders/outputs-index.md`.
