# Próximos pasos — Raíces Brain

Estado al: 2026-06-30
Etapa actual: app web funcional, chat con OpenAI activo, knowledge base en archivos. Sin base de datos ni RAG implementados.

---

## ✅ Completado

- [x] `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.js`
- [x] App Next.js corriendo en `localhost:3000`
- [x] Páginas: Dashboard, Brain (chat), Decisiones, Terrenos, Admin
- [x] Chat funcional con GPT-4o-mini (OpenAI API key configurada)
- [x] Decisiones de Ceibo Vidal cargadas y visibles en `/decisiones`
- [x] Diseño con paleta de Raíces (ink, lino, liquen, musgo, ceibo)

---

## 1. Base de datos (PostgreSQL + pgvector)

**Por qué:** Sin DB, el Brain responde con conocimiento general de GPT, no con el contenido real del repo. Este es el paso más importante que falta.

**Qué hacer:**

- [ ] Instalar PostgreSQL localmente si no está: `brew install postgresql@16`
- [ ] Instalar pgvector: `brew install pgvector`
- [ ] Crear la base de datos:
  ```bash
  psql -U postgres -c "CREATE DATABASE raices_brain;"
  psql -U postgres -d raices_brain -c "CREATE EXTENSION IF NOT EXISTS vector;"
  ```
- [ ] Descomentar y completar `src/lib/db/schema.ts` (el schema ya está escrito, solo falta descomentar)
- [ ] Configurar `DATABASE_URL` en `.env.local`
- [ ] Correr `npx tsx scripts/seed-db.ts` para cargar los datos base

---

## 2. Pipeline de ingesta y RAG

**Por qué:** Es lo que convierte el chat de "GPT genérico" a "Brain que conoce Raíces". Sin esto, el agente no puede citar decisiones reales, proveedores o criterios de terrenos.

**Qué hacer:**

- [ ] Implementar `src/lib/ingestion/` — leer archivos `.md` de `knowledge/`, dividirlos en chunks y generar embeddings con OpenAI (`text-embedding-3-large`)
- [ ] Guardar chunks + embeddings en PostgreSQL con pgvector
- [ ] Indexar todo el conocimiento:
  ```bash
  npx tsx scripts/ingest-folder.ts knowledge/
  ```
- [ ] Implementar `src/lib/ai/rag.ts` — dado un query, buscar los chunks más similares y pasarlos como contexto al chat
- [ ] Actualizar `/api/chat/route.ts` para usar RAG en vez de responder sin contexto
- [ ] Verificar que el chat cita fuentes reales del repo

---

## 3. Autenticación

**Por qué:** La app no tiene login. Cualquiera con acceso a `localhost:3000` puede ver todo. Cuando se comparta con los otros socios, hay que protegerla.

**Qué hacer:**

- [ ] Completar la configuración de NextAuth en `.env.local`:
  ```env
  NEXTAUTH_SECRET=   # openssl rand -base64 32
  NEXTAUTH_URL=http://localhost:3000
  ```
- [ ] Implementar `src/app/api/auth/[...nextauth]/route.ts` con provider de Google o credenciales simples (email/contraseña para los 3 socios)
- [ ] Proteger las rutas con middleware de Next.js
- [ ] Agregar botón de login/logout en el sidebar

---

## 4. Servidor MCP (Claude Desktop / Cursor)

**Por qué:** Permite consultar el Brain directamente desde Claude Desktop o Cursor, sin abrir la app web. Para los socios que usan Claude a diario, esto es lo más cómodo.

**Qué hacer:**

- [ ] Implementar `mcp/server.ts` (la estructura ya está, los tools están marcados con TODO)
- [ ] Implementar los tools: `search_knowledge`, `get_project`, `list_terrains`, `get_latest_decisions`
- [ ] Registrar en Claude Desktop (`~/Library/Application Support/Claude/claude_desktop_config.json`)
- [ ] Probar que funciona: preguntarle a Claude "¿cuáles son las decisiones de Ceibo Vidal?"

---

## 5. Formularios para cargar contenido desde la app

**Por qué:** Hoy para agregar una decisión o registrar un pago hay que editar archivos `.md` a mano. Los socios deberían poder hacerlo desde la UI.

**Qué hacer:**

- [ ] **Nueva decisión** — formulario en `/decisiones/nueva`: título, proyecto, área, descripción → guarda `.md` en `knowledge/projects/`
- [ ] **Registro de pago / movimiento financiero** — formulario en `/finanzas/nuevo`: concepto, monto, fecha, proyecto → guarda en `knowledge/projects/[proyecto]/financials/`
- [ ] **Nuevo terreno** — formulario en `/terrenos/nuevo`: dirección, barrio, estado → guarda `.md` en `knowledge/terrains/pipeline/`
- [ ] **Upload de PDF** — subir planos, contratos, renders → guardar en `knowledge/projects/[proyecto]/documents/`

---

## 6. Completar el conocimiento interno

**Por qué:** El RAG solo es tan bueno como el contenido que indexa. Hay muchos placeholders sin completar.

**Qué hacer:**

- [ ] Completar `knowledge/projects/ceibo-vidal/financials/` con números reales del proyecto
- [ ] Completar `knowledge/projects/ceibo-vidal/brief/` con el brief arquitectónico
- [ ] Cargar los proveedores activos en `knowledge/providers/` (arquitecto, contador, escribano)
- [ ] Actualizar criterios de terreno en `knowledge/terrains/criteria.md` con umbrales reales de la empresa
- [ ] Completar `knowledge/company/strategy/` con la estrategia actual
- [ ] Verificar placeholders:
  ```bash
  npx tsx scripts/check-knowledge-health.ts
  ```

---

## 7. Despliegue (opcional — cuando quieran acceder sin correr el servidor local)

**Por qué:** Hoy la app solo funciona si alguien corre `npm run dev` en su máquina. Si los socios quieren acceder desde el celular o sin abrir VS Code, necesitan un deploy.

**Opción recomendada — Vercel:**

- [ ] Crear cuenta en [vercel.com](https://vercel.com) y conectar el repo de GitHub
- [ ] Agregar las variables de entorno en el panel de Vercel (las mismas que en `.env.local`)
- [ ] **Importante:** Para writes al filesystem (guardar decisiones, PDFs), migrar esa lógica a PostgreSQL antes de deployar (Vercel tiene filesystem de solo lectura)
- [ ] La DB necesita estar en un servicio externo: [Neon](https://neon.tech) (Postgres serverless, tiene free tier generoso) o [Supabase](https://supabase.com)

---

## Orden recomendado

```
1 (DB)  →  2 (RAG)  →  5 (formularios)  →  6 (conocimiento)
              ↓
           3 (auth) y 4 (MCP) en paralelo, cuando haya tiempo
              ↓
           7 (deploy) cuando el sistema esté estable
```

La prioridad absoluta es **1 + 2**: sin base de datos y sin RAG, el Brain es GPT con una UI bonita pero sin conocimiento real de Raíces.
