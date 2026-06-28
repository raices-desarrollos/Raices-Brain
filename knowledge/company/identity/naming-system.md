# Sistema de Naming — Raíces Desarrollos

Define cómo se nombran los proyectos, los archivos, las carpetas y los componentes del sistema.

## Proyectos inmobiliarios

Los proyectos se nombran con una referencia geográfica o natural relacionada con su ubicación o espíritu.

- Formato: `[Elemento natural o nombre propio] [Referencia de calle/barrio opcional]`
- Ejemplos: `Ceibo Vidal`, `Álamo Norte`, `Sauce Belgrano`
- Slug para sistema: `ceibo-vidal`, `alamo-norte`, `sauce-belgrano`

## Archivos y carpetas

| Contexto            | Convención                               | Ejemplo                          |
| ------------------- | ---------------------------------------- | -------------------------------- |
| Carpetas            | `kebab-case`                             | `visual-identity/`               |
| Archivos Markdown   | `kebab-case.md`                          | `brand-manifesto.md`             |
| Archivos TypeScript | `camelCase.ts`                           | `indexDocument.ts`               |
| Componentes React   | `PascalCase.tsx`                         | `BrainPage.tsx`                  |
| Schemas JSON        | `kebab-case.schema.json`                 | `project.schema.json`            |
| Seeds               | `kebab-case.seed.json`                   | `projects.seed.json`             |
| Decisiones          | `YYYY-MM-DD-descripcion-corta.md`        | `2026-06-27-garage-integrado.md` |
| Renders             | `[proyecto]-[vista]-[variante]-v[N].png` | `ceibo-vidal-fachada-dia-v1.png` |

## Versiones de especificaciones

- `[archivo].v1.json` — primera versión
- `[archivo].v2.json` — segunda versión
- `[archivo].current.json` — versión activa (siempre actualizada)

## Variables de entorno

Formato: `SCREAMING_SNAKE_CASE` con prefijo de dominio.
Ejemplos: `OPENAI_API_KEY`, `GITHUB_TOKEN`, `VECTOR_DB_URL`
