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

Abrí [http://localhost:3000/brain](http://localhost:3000/brain) y preguntá lo que necesitás. El chat puede usar herramientas (facturas, pagos, proyectos, documentos, decisiones). Si no hay datos cargados, lo dice: no inventa números.

Podés elegir el agente según el tema:

| Agente      | Para qué sirve                                        |
| ----------- | ----------------------------------------------------- |
| `General`   | Preguntas generales sobre la empresa                  |
| `Terrenos`  | Evaluación de terrenos y análisis del pipeline        |
| `Proyecto`  | Estado, decisiones y avance de proyectos activos      |
| `Finanzas`  | Costos, proyecciones y estructura financiera          |
| `Comercial` | Copy de venta, posicionamiento y estrategia comercial |
| `Legal`     | Contratos, normativa y procesos notariales            |

### Web app (socios)

Navegación principal: **Inicio**, **Proyectos**, **Documentos**, **Facturas**, **Brain**. **Tareas** abre el tablero de ClickUp.

| Ruta | Uso |
| ---- | --- |
| `/` | Dashboard de Ceibo Vidal (métricas reales o vacías, nunca inventadas) |
| `/projects/ceibo-vidal` | Vista del proyecto (resumen, finanzas, documentos, unidades…) |
| `/documentos` | Listado de Google Drive + archivos de la app |
| `/facturas` y `/facturas/nueva` | Listado y carga de facturas |
| `/brain` | Conversación con tools |
| `/factibilidad` | Análisis de terrenos (módulo existente) |

Después de actualizar el schema:

```bash
npm run db:migrate
npm run db:seed
```

`db:migrate` crea tablas nuevas (`projects`, `units`, `invoices` y columnas extra en `documents`). Sin eso, Facturas muestra un aviso y el resto de la app sigue funcionando.

Si Drive no está conectado, Documentos y la subida de facturas siguen disponibles: los archivos se guardan en storage local (`STORAGE_PROVIDER=local`).

**Credenciales que pueden faltar**

| Variable | Para qué |
| -------- | -------- |
| `OPENAI_API_KEY` | Chat, extracción de facturas (fotos) y sync financiera de Excel |
| `GOOGLE_CLIENT_ID` / `SECRET` / `REFRESH_TOKEN` / `GOOGLE_DRIVE_FOLDER_ID` | Listar Drive, subir facturas a Drive, sync |
| `GOOGLE_DRIVE_INVOICES_FOLDER_ID` | Opcional. Destino de facturas; si no está, se usa/crea la carpeta `Facturas` |
| `DATABASE_URL` | Postgres (usuarios, facturas, pagos, documentos) |
| `NEXTAUTH_SECRET` | Login |

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

# Aplicar schema (users, facturas, proyectos, etc.)
npm run db:migrate

# Proyecto inicial (Ceibo Vidal)
npm run db:seed

# Tres socios (emails y passwords en .env.local)
npm run db:users
```

> Si `pgvector` no está instalado: `brew install pgvector` (macOS) o ver las [instrucciones oficiales](https://github.com/pgvector/pgvector).

---

### Paso 5 — Levantar la app

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000). Vas a ver el dashboard de Raíces Brain.

---

## Puesta en producción (v1)

La app es privada: no hay registro público. Solo entran los usuarios creados con `npm run db:users`.

### 1. Postgres (Supabase)

1. Entrá a [https://supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.
2. Nombre: `raices-brain`. Región cercana (ej. `sa-east-1`).
3. Guardá la contraseña de la base.
4. **Project Settings → Database → Connection string → URI**.
5. Copiá la URI y reemplazá `[YOUR-PASSWORD]`.
6. En **SQL Editor** de Supabase:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

7. En tu máquina, con esa URI:

```bash
DATABASE_URL="postgresql://postgres:...@db.XXXX.supabase.co:5432/postgres" npm run db:migrate
DATABASE_URL="..." npm run db:seed
USER1_EMAIL=... USER1_PASSWORD=... USER2_EMAIL=... USER2_PASSWORD=... USER3_EMAIL=... USER3_PASSWORD=... npm run db:users
```

### 2. Google Drive (escritura)

El token anterior era de **solo lectura**. Hay que renovarlo para poder **subir facturas**.

1. [https://console.cloud.google.com](https://console.cloud.google.com) → el proyecto de Raíces.
2. **APIs & Services → Library** → habilitar **Google Drive API**.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**.
   - Tipo: **Desktop app** (el script `get-google-token.ts` usa `http://localhost:3001/oauth2callback`).
   - En **OAuth consent screen**, usuarios de prueba: los 3 gmails de los socios (si la app está en Testing).
4. Copiá Client ID y Secret a `.env.local` (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`).
5. `GOOGLE_DRIVE_FOLDER_ID`: abrí la carpeta Raíces en Drive; el ID es lo que sigue a `folders/` en la URL.
6. En la máquina local:

```bash
npx tsx scripts/get-google-token.ts
```

Autorizá. El script escribe `GOOGLE_REFRESH_TOKEN` en `.env.local`.

### 3. OpenAI

1. [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys) → **Create new secret key**.
2. Copiá a `OPENAI_API_KEY`.

### 4. NextAuth

```bash
openssl rand -base64 32
```

Eso va en `NEXTAUTH_SECRET`. En producción `NEXTAUTH_URL` es la URL de Vercel (ej. `https://raices-brain.vercel.app`).

### 5. Vercel

1. [https://vercel.com/new](https://vercel.com/new) → **Import** el repo `raices-desarrollos/Raices-Brain`.
2. Framework: Next.js. Root: `.`
3. **Environment Variables** (Production + Preview):

| Variable | Valor |
| --- | --- |
| `DATABASE_URL` | URI de Supabase (paso 1) |
| `NEXTAUTH_SECRET` | el de `openssl` |
| `NEXTAUTH_URL` | `https://TU-PROYECTO.vercel.app` (después del primer deploy, actualizá si cambia) |
| `OPENAI_API_KEY` | key de OpenAI |
| `OPENAI_MODEL` | `gpt-4o` |
| `GOOGLE_CLIENT_ID` | de Cloud Console |
| `GOOGLE_CLIENT_SECRET` | de Cloud Console |
| `GOOGLE_REFRESH_TOKEN` | el de `get-google-token.ts` |
| `GOOGLE_DRIVE_FOLDER_ID` | ID de la carpeta raíz en Drive |
| `STORAGE_PROVIDER` | `local` (el archivo canónico es Drive; no hace falta S3) |

4. Deploy. Copiá la URL.
5. Si la URL no era la que pusiste en `NEXTAUTH_URL`, actualizá esa variable y **Redeploy**.

No hay callback de Google en Vercel: Drive usa refresh token de escritorio, no OAuth web.

---

### Google Drive (ingesta y facturas)

Permite listar Drive, subir facturas a `Ceibo Vidal / Facturas` y que Brain busque archivos.

1. Proyecto en [console.cloud.google.com](https://console.cloud.google.com), **Google Drive API** habilitada.
2. OAuth 2.0 **Desktop app**.
3. En `.env.local`: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_DRIVE_FOLDER_ID`.
4. Token (una vez; pide permiso de **escritura**):

```bash
npx tsx scripts/get-google-token.ts
```

### Problemas frecuentes

| Error                         | Causa probable                         | Solución                                 |
| ----------------------------- | -------------------------------------- | ---------------------------------------- |
| `ECONNREFUSED` al arrancar    | PostgreSQL no está corriendo           | `brew services start postgresql` (macOS) |
| `relation "X" does not exist` | Migraciones no aplicadas               | `npm run db:migrate`                     |
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
