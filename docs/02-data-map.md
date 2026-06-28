# Mapa de Datos

Descripción de qué tipo de información vive en cada sección del repositorio y cómo fluye hacia el sistema RAG.

## Categorías de datos

| Categoría                  | Ubicación                               | Formato                 | Indexable              |
| -------------------------- | --------------------------------------- | ----------------------- | ---------------------- |
| Identidad corporativa      | `knowledge/company/identity/`           | Markdown                | Sí                     |
| Estrategia                 | `knowledge/company/strategy/`           | Markdown                | Sí                     |
| Decisiones                 | `knowledge/*/decisions/`                | Markdown                | Sí                     |
| Briefings de proyecto      | `knowledge/projects/*/brief/`           | Markdown                | Sí                     |
| Especificaciones de render | `knowledge/projects/*/visual-identity/` | Markdown + JSON         | Sí                     |
| Planos y renders           | `knowledge/projects/*/renders/`         | Imágenes (no indexadas) | No (solo metadata)     |
| Finanzas                   | `knowledge/projects/*/financials/`      | Markdown                | Sí (con redacción)     |
| Proveedores                | `knowledge/providers/`                  | Markdown                | Sí                     |
| Terrenos                   | `knowledge/terrains/`                   | Markdown + JSON         | Sí                     |
| Prompts                    | `prompts/`                              | Markdown                | No (son instrucciones) |
| Agentes                    | `agents/`                               | Markdown                | No (son instrucciones) |
| Schemas                    | `data/schemas/`                         | JSON Schema             | No                     |

## Flujo de ingesta

```
Fuente (GitHub / Drive / Manual)
  → Normalización (src/lib/ingestion/normalize.ts)
  → Chunking (src/lib/ingestion/chunk.ts)
  → Embedding (src/lib/ai/embeddings.ts)
  → Indexación en vector DB (src/lib/ingestion/index-document.ts)
  → Disponible para RAG (src/lib/ai/rag.ts)
```

## Prioridad de indexación

1. Decisiones (alta densidad de conocimiento)
2. Briefings de proyecto
3. Especificaciones de render
4. Identidad y estrategia corporativa
5. Finanzas (con redacción de datos sensibles)
6. Proveedores y terrenos
