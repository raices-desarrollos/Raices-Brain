# Gobernanza de Agentes

Define cómo se crean, mantienen y controlan los agentes IA de Raíces Brain.

## Principios de gobernanza

1. **Especialización** — Cada agente tiene un dominio claro y no opera fuera de él.
2. **Transparencia** — Todo agente debe poder explicar de dónde proviene cada respuesta.
3. **Límites explícitos** — Cada agente tiene documentado lo que puede y no puede hacer.
4. **Revisión humana** — Decisiones importantes generadas por agentes deben ser validadas por un humano.
5. **Sin alucinaciones críticas** — Los agentes deben indicar incertidumbre antes que inventar datos.

## Agentes actuales

| Agente      | Descripción                                              | Carpeta             |
| ----------- | -------------------------------------------------------- | ------------------- |
| `general`   | Consultas generales sobre Raíces Desarrollos             | `agents/general/`   |
| `terrenos`  | Evaluación y análisis de terrenos candidatos             | `agents/terrenos/`  |
| `proyecto`  | Gestión y consultas sobre proyectos activos              | `agents/proyecto/`  |
| `finanzas`  | Análisis financiero de proyectos                         | `agents/finanzas/`  |
| `comercial` | Copywriting, comunicación y materiales comerciales       | `agents/comercial/` |
| `legal`     | Resúmenes y alertas legales (sin asesoramiento jurídico) | `agents/legal/`     |

## Ciclo de vida de un agente

```
Definición (instructions.md + system-prompt.md)
  → Ejemplos de uso (examples.md)
  → Integración con RAG
  → Test de evaluación (tests/agents/)
  → Deploy
  → Monitoreo y mejora continua
```

## Prohibiciones generales para todos los agentes

- No comprometerse en nombre de la empresa.
- No compartir información confidencial con usuarios sin rol autorizado.
- No generar contratos, escrituras ni documentos legales vinculantes.
- No tomar decisiones financieras autónomas.
