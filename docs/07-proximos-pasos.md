# Próximos pasos — Raíces Brain

Estado al: 2026-06-28
Etapa actual: estructura inicial creada, conocimiento parcialmente poblado, sin lógica implementada.

---

## 1. Completar el conocimiento antes de implementar código

**Por qué es lo primero:** El valor del sistema depende de la calidad de la base de conocimiento. Un brain con datos falsos o placeholders no sirve de nada.

**Qué hacer:**

- [ ] Completar números reales en `knowledge/projects/ceibo-vidal/financials/`
- [ ] Cargar proveedores concretos en `knowledge/providers/`
- [ ] Actualizar criterios de terreno en `knowledge/terrains/criteria.md` con umbrales reales
- [ ] Revisar `scripts/check-knowledge-health.ts` para detectar placeholders pendientes:
  ```bash
  npx tsx scripts/check-knowledge-health.ts
  ```

---

## 2. Conectar el MCP server a Claude o Cursor

**Por qué es lo segundo:** Es lo que más ROI inmediato da. Permite hacerle preguntas al conocimiento existente desde Cursor o Claude Desktop sin necesitar la app web. Valida que el conocimiento es útil antes de invertir en infraestructura.

**Qué hacer:**

- [ ] Instalar dependencia: `npm install @modelcontextprotocol/sdk`
- [ ] Implementar `mcp/server.ts` (los TODOs ya están marcados)
- [ ] Registrar el servidor en la config de Claude Desktop o Cursor
- [ ] Ver instrucciones detalladas en `mcp/README.md`

---

## 3. Inicializar el proyecto Next.js

**Por qué:** El repo tiene código TypeScript pero no tiene `package.json`. Sin esto, no hay app, no hay API y no hay pipeline.

**Qué hacer:**

- [ ] Crear `package.json` con las dependencias del stack:
  - `next`, `react`, `react-dom`
  - `openai`
  - `drizzle-orm`, `pg`
  - `@modelcontextprotocol/sdk`
  - `vitest` (dev)
- [ ] Crear `tsconfig.json` y `next.config.ts`
- [ ] Configurar `.env.local` desde `.env.example`
- [ ] Correr `npm install && npm run dev`

---

## 4. Implementar el pipeline de ingesta y RAG

**Por qué:** Sin esto, el sistema no puede responder preguntas basadas en el conocimiento del repo. Es el núcleo técnico del sistema.

**Qué hacer:**

- [ ] Levantar PostgreSQL local con extensión `pgvector`
- [ ] Implementar schema de Drizzle en `src/lib/db/schema.ts`
- [ ] Implementar `src/lib/ingestion/` (chunk → embed → guardar en DB)
- [ ] Implementar `src/lib/ai/rag.ts` (recuperar por similitud → construir contexto → responder)
- [ ] Correr `npx tsx scripts/seed-db.ts` para poblar la DB inicial
- [ ] Correr `npx tsx scripts/ingest-folder.ts knowledge/` para indexar todo el conocimiento

---

## 5. Establecer el hábito de mantener el brain actualizado

**Por qué:** La estructura técnica es inútil si el conocimiento se desactualiza. Este es el riesgo más alto a largo plazo.

**Reglas a adoptar:**

- [ ] Cada decisión de proyecto → nueva entrada en `knowledge/projects/<proyecto>/decisions/`
- [ ] Cada reunión importante → minuta en `knowledge/` usando la skill `crear-minuta-reunion`
- [ ] Cada cambio de criterio o estrategia → actualizar el archivo correspondiente en `knowledge/company/`
- [ ] Correr `check-knowledge-health.ts` una vez por semana

---

## Orden recomendado

```
1 → 2 → 3 → 4 → 5 (continuo)
```

Empezar por el MCP (paso 2) permite validar que el conocimiento existente es útil antes de invertir tiempo en la infraestructura completa.
