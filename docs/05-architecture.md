# Arquitectura de Raíces Brain

Descripción técnica del sistema, sus componentes y cómo interactúan.

## Diagrama de alto nivel

```
┌─────────────────────────────────────────────────────────────┐
│                      Raíces Brain App                        │
│                    (Next.js App Router)                      │
├──────────────┬──────────────────────────┬───────────────────┤
│  /brain      │  /admin                  │  /api             │
│  Chat UI     │  Fuentes · Docs · Agentes│  REST + Streaming │
└──────┬───────┴──────────────────────────┴────────┬──────────┘
       │                                            │
       ▼                                            ▼
┌─────────────────┐                    ┌────────────────────────┐
│   RAG Engine    │◄───────────────────│   Ingestion Pipeline   │
│  rag.ts         │                    │  GitHub / Drive / Manual│
└────────┬────────┘                    └────────────────────────┘
         │
         ├── Embedding (text-embedding-3-large)
         ├── Vector Search (pgvector / Pinecone)
         ├── Reranking
         └── Context Assembly → LLM (GPT-4o)
                                      │
                                      ▼
                           ┌──────────────────┐
                           │   MCP Server     │
                           │  mcp/server.ts   │
                           └──────────────────┘
```

## Componentes principales

| Componente | Ubicación                  | Responsabilidad                                        |
| ---------- | -------------------------- | ------------------------------------------------------ |
| App UI     | `src/app/`                 | Interfaz de usuario Next.js                            |
| RAG Engine | `src/lib/ai/rag.ts`        | Recuperación y generación aumentada                    |
| Embeddings | `src/lib/ai/embeddings.ts` | Vectorización de documentos                            |
| DB         | `src/lib/db/`              | PostgreSQL + Drizzle ORM                               |
| Ingesta    | `src/lib/ingestion/`       | Normalización, chunking e indexación                   |
| Seguridad  | `src/lib/security/`        | Permisos, redacción y auditoría                        |
| Dominio    | `src/lib/domain/`          | Lógica de negocio inmobiliaria                         |
| MCP        | `mcp/`                     | Tools para integración con Claude Desktop y otros LLMs |

## Stack tecnológico

- **Runtime:** Node.js 20+
- **Framework:** Next.js 14+ con App Router
- **ORM:** Drizzle ORM
- **Vector DB:** pgvector (desarrollo) / Pinecone (producción)
- **IA:** OpenAI SDK (GPT-4o + text-embedding-3-large)
- **MCP:** @modelcontextprotocol/sdk
- **Testing:** Vitest
