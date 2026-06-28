# MCP Server — Raíces Brain

Servidor Model Context Protocol (MCP) de Raíces Desarrollos. Permite que herramientas externas como Claude Desktop, Cursor u otros LLMs accedan al knowledge base y las funcionalidades del sistema.

## Qué expone el MCP Server

| Tool                   | Descripción                                   |
| ---------------------- | --------------------------------------------- |
| `search_knowledge`     | Búsqueda semántica en el knowledge base       |
| `get_project`          | Obtiene los datos de un proyecto              |
| `list_terrains`        | Lista el pipeline de terrenos                 |
| `evaluate_terrain`     | Evalúa un terreno con la rúbrica de Raíces    |
| `get_latest_decisions` | Obtiene las últimas decisiones de un proyecto |
| `create_action_item`   | Registra un ítem de acción pendiente          |

## Cómo iniciar el servidor MCP

```bash
npx tsx mcp/server.ts
```

O configurarlo en Claude Desktop via `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "raices-brain": {
      "command": "npx",
      "args": ["tsx", "/path/to/raices-brain/mcp/server.ts"]
    }
  }
}
```

## Dependencias

- `@modelcontextprotocol/sdk` — SDK oficial de MCP
- `tsx` — Para ejecutar TypeScript directamente

## Estado

> Placeholder: implementación pendiente. Ver `server.ts` para la estructura base.
