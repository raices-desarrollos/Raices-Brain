#!/usr/bin/env tsx
// Script: ingest-folder.ts
// Indexa todos los documentos de una carpeta local en la base vectorial
// Uso: npx tsx scripts/ingest-folder.ts <path-to-folder>

import path from 'path';

async function main() {
  const folderArg = process.argv[2];

  if (!folderArg) {
    console.error('Uso: npx tsx scripts/ingest-folder.ts <path-to-folder>');
    console.error('Ejemplo: npx tsx scripts/ingest-folder.ts knowledge/projects/ceibo-vidal');
    process.exit(1);
  }

  const folderPath = path.resolve(folderArg);
  console.log(`Indexando carpeta: ${folderPath}`);

  // TODO:
  // const files = listFilesRecursive(folderPath, ['.md', '.json'])
  // console.log(`Archivos encontrados: ${files.length}`)
  // for (const file of files) {
  //   const content = readTextFile(file)
  //   if (!content) continue
  //   await indexDocument(content, {
  //     source: 'github',
  //     sourceUrl: file,
  //     filePath: path.relative(process.cwd(), file),
  //   })
  //   console.log(`Indexado: ${file}`)
  // }

  console.log('ingest-folder: pendiente de implementación');
}

main().catch(console.error);
