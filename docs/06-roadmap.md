# Roadmap de Raíces Brain

Planificación de fases de desarrollo del cerebro corporativo.

## Fase 0 — Fundación (actual)

- [x] Estructura de repositorio completa
- [x] Conocimiento inicial de Ceibo Vidal
- [x] Schemas de datos
- [x] Documentación de arquitectura y gobernanza
- [ ] Completar knowledge base de identidad corporativa
- [ ] Completar knowledge base de Ceibo Vidal

## Fase 1 — RAG básico

- [ ] Setup Next.js con App Router
- [ ] Configurar PostgreSQL + pgvector
- [ ] Pipeline de ingesta desde este repo (GitHub)
- [ ] Chat básico con RAG sobre el conocimiento existente
- [ ] Admin para ver documentos indexados

## Fase 2 — Agentes especializados

- [ ] Agente de terrenos con rubrica de evaluación
- [ ] Agente de proyecto con acceso a Ceibo Vidal
- [ ] Agente comercial para generación de copy
- [ ] Tests de evaluación de calidad (evals/)

## Fase 3 — Conectores e ingesta avanzada

- [ ] Conector Google Drive
- [ ] Upload manual de documentos (PDF, DOCX)
- [ ] Ingesta incremental (solo documentos nuevos/modificados)
- [ ] Redacción automática de datos sensibles

## Fase 4 — MCP y extensibilidad

- [ ] Servidor MCP propio con todas las tools
- [ ] Integración con Claude Desktop
- [ ] API pública para herramientas externas
- [ ] Dashboard de salud del knowledge base

## Fase 5 — Producción

- [ ] Deploy en Vercel / Railway
- [ ] Autenticación con roles (NextAuth)
- [ ] Monitoreo y alertas
- [ ] Backup automático de la base vectorial
