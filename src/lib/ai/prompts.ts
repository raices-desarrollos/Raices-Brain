// Gestión y carga de prompts del sistema
// Carga los system prompts de los agentes desde los archivos Markdown

import fs from 'fs';
import path from 'path';

const AGENTS_DIR = path.join(process.cwd(), 'agents');

/**
 * Carga el system prompt de un agente desde su archivo Markdown.
 * @param agentSlug El slug del agente (ej: 'general', 'terrenos', 'proyecto')
 * @returns El contenido del system prompt
 */
export function loadAgentSystemPrompt(agentSlug: string): string {
  const promptPath = path.join(AGENTS_DIR, agentSlug, 'system-prompt.md');

  if (!fs.existsSync(promptPath)) {
    throw new Error(`System prompt no encontrado para el agente: ${agentSlug}`);
  }

  const content = fs.readFileSync(promptPath, 'utf-8');

  // Extraer el contenido del bloque de código Markdown si existe
  const codeBlockMatch = content.match(/```[\s\S]*?\n([\s\S]+?)\n```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  return content.trim();
}

/**
 * Construye el prompt de usuario con el contexto RAG.
 * @param query La pregunta del usuario
 * @param context Los documentos recuperados para el contexto
 * @returns El prompt de usuario con el contexto integrado
 */
export function buildUserPromptWithContext(query: string, context: string): string {
  return `CONTEXTO DEL KNOWLEDGE BASE:
${context}

---

PREGUNTA:
${query}`;
}
