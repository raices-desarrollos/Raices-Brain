# Raíces Brain

Cerebro digital de **Raíces Desarrollos** — desarrolladora inmobiliaria argentina.

## Qué es esto

Raíces Brain es el sistema de conocimiento e inteligencia operativa de Raíces Desarrollos. Su función es concentrar todo el saber interno de la empresa —identidad de marca, estrategia, proyectos, terrenos, proveedores, decisiones— en un único repositorio estructurado, y ponerlo a disposición de agentes IA especializados que pueden consultarlo, razonarlo y actuar sobre él.

En la práctica significa que cualquier pregunta relevante para el negocio —"¿cuál es la tipología del piso 3 de Ceibo Vidal?", "¿qué terrenos pasaron el filtro de evaluación?", "¿qué decidimos sobre la fachada?"— tiene una respuesta fundamentada en la información real de la empresa, no en la memoria de una persona.

## Para qué existe

- **Evitar que el conocimiento viva en cabezas o chats dispersos.** Cada decisión, brief, criterio y número tiene un lugar canónico en este repo.
- **Hacer que la IA razone sobre contexto real.** Los agentes no inventan: buscan en la base de conocimiento y responden con fuente.
- **Acelerar operaciones repetitivas.** Evaluar un terreno, preparar un reporte de socios, redactar copy comercial, generar minutas — todo tiene un agente o skill dedicado.
- **Mantener trazabilidad.** Cada decisión importante queda registrada con fecha, contexto y razonamiento.

## Cómo usarlo

### 1. Consultar el conocimiento (vía chat)

Corré la app y usá la interfaz `/brain` para hacerle preguntas al sistema:

```bash
cp .env.example .env.local   # configurar claves de OpenAI, DB, etc.
npm install
npm run dev
# → abrir http://localhost:3000/brain
```

### 2. Usar un agente especializado

Cada agente tiene su carpeta en `agents/` con instrucciones y ejemplos. Podés invocarlos desde la UI o directamente vía API:

```bash
POST /api/agents
{ "agent": "terrenos", "query": "Evaluá este terreno en Palermo..." }
```

Agentes disponibles: `general`, `terrenos`, `proyecto`, `finanzas`, `comercial`, `legal`.

### 3. Agregar conocimiento nuevo

**Opción A — Editar directamente:** Agregá o modificá archivos en `knowledge/`. La estructura es autoexplicativa.

**Opción B — Ingesta desde fuentes externas:**

```bash
npx tsx scripts/sync-github.ts      # sincronizar desde GitHub
npx tsx scripts/sync-drive.ts       # sincronizar desde Google Drive
npx tsx scripts/ingest-folder.ts    # ingestar una carpeta local
```

**Opción C — Upload manual:** Usá el panel `/admin/sources` en la app.

### 4. Verificar salud de la base de conocimiento

```bash
npx tsx scripts/check-knowledge-health.ts
```

Reporta archivos vacíos, placeholders sin completar y documentos faltantes.

### 5. Conectar con un LLM externo (MCP)

El servidor MCP en `mcp/server.ts` expone tools para que Claude, Cursor u otros LLMs consulten la base de conocimiento directamente. Ver `mcp/README.md` para instrucciones de configuración.

## Estructura

| Carpeta      | Descripción                                                                   |
| ------------ | ----------------------------------------------------------------------------- |
| `docs/`      | Documentación estratégica y técnica del proyecto                              |
| `knowledge/` | Conocimiento interno estructurado (empresa, proyectos, terrenos, proveedores) |
| `agents/`    | Definición de agentes IA especializados                                       |
| `prompts/`   | Prompts reutilizables y específicos por proyecto                              |
| `skills/`    | Skills modulares para los agentes                                             |
| `data/`      | Schemas JSON, seeds y exportaciones                                           |
| `src/`       | Código fuente de la app Next.js                                               |
| `mcp/`       | Servidor MCP y tools para integración con LLMs                                |
| `scripts/`   | Scripts de sincronización e ingesta                                           |
| `tests/`     | Tests de RAG y agentes                                                        |
| `evals/`     | Evaluaciones de calidad de respuestas                                         |

## Stack previsto

- **Framework:** Next.js 14+ (App Router)
- **IA:** OpenAI GPT-4o + embeddings text-embedding-3-large
- **Vector DB:** pgvector / Pinecone
- **DB:** PostgreSQL con Drizzle ORM
- **MCP:** Servidor Model Context Protocol propio
- **Ingesta:** GitHub, Google Drive, upload manual

## Inicio rápido

```bash
cp .env.example .env.local
npm install
npm run dev
```

## Principio rector

> El conocimiento de Raíces debe ser tan estructurado que una IA pueda razonarlo, y tan claro que cualquier persona pueda entenderlo.
