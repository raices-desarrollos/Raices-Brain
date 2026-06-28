# Data — Raíces Brain

Este directorio contiene los schemas de datos, seeds iniciales y exportaciones del sistema.

## Estructura

| Carpeta    | Descripción                                                        |
| ---------- | ------------------------------------------------------------------ |
| `schemas/` | Schemas JSON que definen la estructura de cada entidad del sistema |
| `seed/`    | Datos iniciales para poblar la base de datos en desarrollo         |
| `exports/` | Exportaciones temporales (ignoradas por git, salvo el .gitkeep)    |

## Uso de los schemas

Los schemas en `schemas/` son la fuente de verdad para:

- La estructura de la base de datos (via Drizzle ORM en `src/lib/db/schema.ts`)
- La validación de datos en la API
- La generación de tipos TypeScript

## Uso de los seeds

Los seeds en `seed/` se usan para inicializar la base de datos en desarrollo:

```bash
npm run seed
# o
npx tsx scripts/seed-db.ts
```
