// Servidor MCP de Raíces Brain
// Expone el knowledge base y funcionalidades del sistema via Model Context Protocol

// TODO: Instalar dependencia: npm install @modelcontextprotocol/sdk

// import { Server } from '@modelcontextprotocol/sdk/server/index.js'
// import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
// import {
//   CallToolRequestSchema,
//   ListToolsRequestSchema,
// } from '@modelcontextprotocol/sdk/types.js'

// import { searchKnowledge } from './tools/search-knowledge'
// import { getProject } from './tools/get-project'
// import { listTerrains } from './tools/list-terrains'
// import { evaluateTerrain } from './tools/evaluate-terrain'
// import { getLatestDecisions } from './tools/get-latest-decisions'
// import { createActionItem } from './tools/create-action-item'

// const server = new Server(
//   {
//     name: 'raices-brain',
//     version: '0.1.0',
//   },
//   {
//     capabilities: {
//       tools: {},
//     },
//   }
// )

// server.setRequestHandler(ListToolsRequestSchema, async () => {
//   return {
//     tools: [
//       searchKnowledge.definition,
//       getProject.definition,
//       listTerrains.definition,
//       evaluateTerrain.definition,
//       getLatestDecisions.definition,
//       createActionItem.definition,
//     ],
//   }
// })

// server.setRequestHandler(CallToolRequestSchema, async (request) => {
//   const { name, arguments: args } = request.params

//   switch (name) {
//     case 'search_knowledge':
//       return searchKnowledge.handler(args)
//     case 'get_project':
//       return getProject.handler(args)
//     case 'list_terrains':
//       return listTerrains.handler(args)
//     case 'evaluate_terrain':
//       return evaluateTerrain.handler(args)
//     case 'get_latest_decisions':
//       return getLatestDecisions.handler(args)
//     case 'create_action_item':
//       return createActionItem.handler(args)
//     default:
//       throw new Error(`Tool desconocida: ${name}`)
//   }
// })

// async function main() {
//   const transport = new StdioServerTransport()
//   await server.connect(transport)
//   console.error('Raíces Brain MCP Server iniciado')
// }

// main().catch(console.error)

// Placeholder: descomentar cuando se instale @modelcontextprotocol/sdk
console.log('Raíces Brain MCP Server — pendiente de implementación');
