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

Hay dos capas de conocimiento:

1. **Git (`knowledge/company`, `knowledge/projects`, …)** — lo que el equipo edita y versiona: briefs, decisiones, copy. Esto viaja con el clone.
2. **Drive → `knowledge/sync-drive/`** — PDFs, Excel, escrituras. Se baja en cada máquina y **no se commitea**.

### Día a día

```bash
git pull
npm install                 # solo si cambió package.json
npm run sync:drive          # si necesitás la última versión de Drive
npm run dev                 # app en http://localhost:3000
```

Después de sync, los archivos quedan en `knowledge/sync-drive/` (local). Si un dato tiene que ser canónico para el Brain, copiá o resumí lo relevante a un `.md` en `knowledge/projects/…` y eso sí va a Git.

**No** hagas `git add` de PDFs/planillas bajadas de Drive.

### Chat con el Brain

Abrí [http://localhost:3000/brain](http://localhost:3000/brain) y preguntá lo que necesitás. Podés elegir el agente según el tema:

| Agente      | Para qué sirve                                        |
| ----------- | ----------------------------------------------------- |
| `General`   | Preguntas generales sobre la empresa                  |
| `Terrenos`  | Evaluación de terrenos y análisis del pipeline        |
| `Proyecto`  | Estado, decisiones y avance de proyectos activos      |
| `Finanzas`  | Costos, proyecciones y estructura financiera          |
| `Comercial` | Copy de venta, posicionamiento y estrategia comercial |
| `Legal`     | Contratos, normativa y procesos notariales            |

### Agregar conocimiento nuevo

**Opción A — Editar directamente:** Agregá o modificá archivos en `knowledge/`. Cada carpeta tiene un `README.md` que explica la estructura.

**Opción B — Ingesta desde fuentes externas:**

```bash
npm run sync:drive                   # sincronizar desde Google Drive
npx tsx scripts/sync-github.ts       # sincronizar desde GitHub
npx tsx scripts/ingest-folder.ts     # ingestar una carpeta local
```

**Opción C — Upload manual:** Usá el panel `/admin/sources` en la app.

### Registrar una decisión

Creá un archivo `.md` en `knowledge/projects/[proyecto]/decisions/` con el formato:

```
# Decisión: [título]

**Fecha:** YYYY-MM-DD
**Proyecto:** [nombre]
**Área:** [arquitectura / finanzas / comercial / legal]
**Estado:** Aprobada y vigente

## La decisión
[Una o dos oraciones que resuman la decisión tomada.]

## Contexto
[Por qué se debatió y qué alternativas se consideraron.]

## Razón de la decisión
[Por qué se eligió esta opción.]
```

### Verificar salud del knowledge base

```bash
npx tsx scripts/check-knowledge-health.ts
```

Reporta archivos vacíos, placeholders sin completar y documentos faltantes.

### Mantener el Brain al día

```bash
npm install            # primera vez, o si cambió package.json
npm run sync:drive     # Drive → knowledge/sync-drive/ (solo local)
```

`npm run sync:drive` requiere `.env.local` con Google (ver más abajo). OAuth es una sola vez: `npx tsx scripts/get-google-token.ts`.

Carpetas excluidas de la sync: ver `SKIP_FOLDER_NAMES` en `scripts/sync-drive.ts` (hoy: `Estudio de oferta`).

---

## Instalación

Instrucciones para clonar y poner en marcha el proyecto desde cero en una máquina nueva.

### Requisitos previos

| Herramienta | Versión mínima | Cómo verificar   |
| ----------- | -------------- | ---------------- |
| Node.js     | 18+            | `node --version` |
| npm         | 9+             | `npm --version`  |
| Git         | cualquiera     | `git --version`  |
| PostgreSQL  | 14+            | `psql --version` |

> **Recomendado:** [VS Code](https://code.visualstudio.com/) con las extensiones de GitHub Copilot.

---

### Paso 1 — Clonar el repositorio

```bash
git clone https://github.com/raices-desarrollos/raices-brain.git
cd raices-brain
```

> Si el repositorio es privado y no tenés acceso, pedíselo a Darío.

---

### Paso 2 — Instalar dependencias

```bash
npm install
```

Instala Next.js, Drizzle ORM, OpenAI SDK, el SDK de MCP y todas las dependencias de TypeScript.

---

### Paso 3 — Configurar variables de entorno

```bash
cp .env.example .env.local
```

Abrí `.env.local` y completá los valores. Las credenciales reales (API keys, tokens) **nunca están en el repo** — pedíselas a Darío.

```env
# ─── Mínimo para arrancar ─────────────────────────────────────────────────────
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://user:password@localhost:5432/raices_brain
NEXTAUTH_SECRET=          # generá uno con: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
```

La app levanta sin `OPENAI_API_KEY`, pero el chat no va a funcionar hasta que la configures.

---

### Paso 4 — Crear la base de datos

```bash
# Crear la base de datos
psql -U postgres -c "CREATE DATABASE raices_brain;"

# Habilitar pgvector (búsqueda semántica)
psql -U postgres -d raices_brain -c "CREATE EXTENSION IF NOT EXISTS vector;"

# Cargar datos iniciales
npx tsx scripts/seed-db.ts
```

> Si `pgvector` no está instalado: `brew install pgvector` (macOS) o ver las [instrucciones oficiales](https://github.com/pgvector/pgvector).

---

### Paso 5 — Levantar la app

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000). Vas a ver el dashboard de Raíces Brain.

---

### Problemas frecuentes

| Error                         | Causa probable                         | Solución                                 |
| ----------------------------- | -------------------------------------- | ---------------------------------------- |
| `ECONNREFUSED` al arrancar    | PostgreSQL no está corriendo           | `brew services start postgresql` (macOS) |
| `relation "X" does not exist` | Migraciones no aplicadas               | `npx tsx scripts/seed-db.ts`             |
| `Invalid API Key` de OpenAI   | Falta `OPENAI_API_KEY` en `.env.local` | Completar con la clave real              |
| Puerto 3000 en uso            | Otro proceso ocupa el puerto           | `npm run dev -- -p 3001`                 |

---

## Guía de conexión

Instrucciones para conectar Raíces Brain con servicios externos.

### OpenAI (chat y embeddings)

1. Ingresá a [platform.openai.com](https://platform.openai.com) y creá una API key.
2. Pegá la clave en `.env.local`:
   ```env
   OPENAI_API_KEY=sk-proj-...
   OPENAI_MODEL=gpt-4o
   OPENAI_EMBEDDING_MODEL=text-embedding-3-large
   ```
3. Reiniciá el servidor (`npm run dev`). El chat en `/brain` queda habilitado.

---

### Google Drive (ingesta de documentos)

Permite sincronizar automáticamente documentos de una carpeta de Drive al knowledge base.

1. Creá un proyecto en [Google Cloud Console](https://console.cloud.google.com).
2. Habilitá la **Google Drive API**.
3. Creá credenciales OAuth 2.0 de tipo "Aplicación de escritorio".
4. Descargá el archivo `credentials.json` y guardalo en la raíz del repo (está en `.gitignore`).
5. Obtenés el refresh token corriendo:
   ```bash
   npx tsx scripts/get-google-token.ts
   ```
   Esto abre el navegador, autorizás la app con tu cuenta de Google y el script guarda el token.
6. Completá en `.env.local`:
   ```env
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   GOOGLE_REFRESH_TOKEN=...
   GOOGLE_DRIVE_FOLDER_ID=...   # ID de la carpeta a sincronizar (de la URL de Drive)
   ```
7. Para sincronizar:
   ```bash
   npm run sync:drive
   ```

---

### GitHub (ingesta desde repos)

Permite importar documentación y archivos de conocimiento desde repositorios de GitHub.

1. Creá un [Personal Access Token](https://github.com/settings/tokens) con scope `repo` (o `read:org` si el repo es de una organización).
2. Completá en `.env.local`:
   ```env
   GITHUB_TOKEN=ghp_...
   GITHUB_REPO=raices-desarrollos/raices-brain
   ```
3. Para sincronizar:
   ```bash
   npx tsx scripts/sync-github.ts
   ```

---

### MCP (Claude Desktop / Cursor)

El servidor MCP permite que Claude Desktop, Cursor u otros clientes de IA accedan al knowledge base directamente.

1. Levantá el servidor:
   ```bash
   npx tsx mcp/server.ts
   ```
2. O configuralo permanentemente en `claude_desktop_config.json`:

   ```json
   {
     "mcpServers": {
       "raices-brain": {
         "command": "npx",
         "args": ["tsx", "/ruta/absoluta/al/repo/mcp/server.ts"]
       }
     }
   }
   ```

   En macOS el archivo está en `~/Library/Application Support/Claude/claude_desktop_config.json`.

3. Reiniciá Claude Desktop. El Brain aparece como herramienta disponible.

Ver [mcp/README.md](mcp/README.md) para más detalles sobre los tools disponibles.

---

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

## Stack

- **Framework:** Next.js 15 (App Router)
- **IA:** OpenAI GPT-4o + embeddings text-embedding-3-large
- **Vector DB:** pgvector (PostgreSQL) / Pinecone
- **DB:** PostgreSQL con Drizzle ORM
- **MCP:** Servidor Model Context Protocol propio
- **Ingesta:** GitHub, Google Drive, upload manual

---

> El conocimiento de Raíces debe ser tan estructurado que una IA pueda razonarlo, y tan claro que cualquier persona pueda entenderlo.
