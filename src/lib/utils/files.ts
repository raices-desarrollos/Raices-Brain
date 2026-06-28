// Utilidades de archivos
// Funciones para manejo de archivos en el pipeline de ingesta

import fs from 'fs';
import path from 'path';

/**
 * Lee el contenido de un archivo de texto de forma segura.
 * @param filePath Path absoluto al archivo
 */
export function readTextFile(filePath: string): string | null {
  if (!fs.existsSync(filePath)) return null;
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * Lista recursivamente todos los archivos de un directorio.
 * @param dir Path al directorio
 * @param extensions Extensiones a incluir (ej: ['.md', '.json'])
 */
export function listFilesRecursive(dir: string, extensions: string[] = []): string[] {
  if (!fs.existsSync(dir)) return [];

  const results: string[] = [];

  function walk(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (
        extensions.length === 0 ||
        extensions.includes(path.extname(entry.name).toLowerCase())
      ) {
        results.push(fullPath);
      }
    }
  }

  walk(dir);
  return results;
}

/**
 * Retorna la extensión de un archivo en minúsculas sin el punto.
 */
export function getExtension(filename: string): string {
  return path.extname(filename).toLowerCase().slice(1);
}
