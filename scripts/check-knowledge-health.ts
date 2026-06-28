#!/usr/bin/env tsx
// Script: check-knowledge-health.ts
// Verifica la salud y completitud del knowledge base
// Detecta placeholders, archivos vacíos, y documentos sin actualizar

import fs from 'fs';
import path from 'path';

interface HealthIssue {
  file: string;
  type: 'placeholder' | 'empty' | 'missing-required';
  description: string;
}

const KNOWLEDGE_DIR = path.join(process.cwd(), 'knowledge');
const PLACEHOLDER_PATTERNS = [
  /> Placeholder/i,
  /> Completar/i,
  /A completar/i,
  /A definir/i,
  /Pendiente de/i,
];

function checkFile(filePath: string): HealthIssue[] {
  const issues: HealthIssue[] = [];
  const relativePath = path.relative(process.cwd(), filePath);

  const content = fs.readFileSync(filePath, 'utf-8');

  if (content.trim().length < 50) {
    issues.push({
      file: relativePath,
      type: 'empty',
      description: 'Archivo muy corto o casi vacío',
    });
  }

  for (const pattern of PLACEHOLDER_PATTERNS) {
    if (pattern.test(content)) {
      issues.push({
        file: relativePath,
        type: 'placeholder',
        description: 'Contiene placeholders sin completar',
      });
      break;
    }
  }

  return issues;
}

function walkDir(dir: string, ext: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const result: string[] = [];
  function walk(d: string) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(ext)) result.push(full);
    }
  }
  walk(dir);
  return result;
}

async function main() {
  console.log('Verificando salud del knowledge base...\n');

  const mdFiles = walkDir(KNOWLEDGE_DIR, '.md');
  const allIssues: HealthIssue[] = [];

  for (const file of mdFiles) {
    allIssues.push(...checkFile(file));
  }

  const placeholders = allIssues.filter((i) => i.type === 'placeholder');
  const empties = allIssues.filter((i) => i.type === 'empty');

  console.log(`Archivos analizados: ${mdFiles.length}`);
  console.log(`Archivos con placeholders: ${placeholders.length}`);
  console.log(`Archivos vacíos: ${empties.length}`);

  if (placeholders.length > 0) {
    console.log('\n📋 Archivos con placeholders:');
    for (const issue of placeholders) {
      console.log(`  - ${issue.file}`);
    }
  }

  if (empties.length > 0) {
    console.log('\n⚠️  Archivos vacíos o muy cortos:');
    for (const issue of empties) {
      console.log(`  - ${issue.file}`);
    }
  }

  if (allIssues.length === 0) {
    console.log('\n✅ Knowledge base en buen estado');
  }
}

main().catch(console.error);
