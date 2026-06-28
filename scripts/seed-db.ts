#!/usr/bin/env tsx
// Script: seed-db.ts
// Pobla la base de datos con los datos iniciales de los seeds

import fs from 'fs';
import path from 'path';

async function main() {
  console.log('Iniciando seed de la base de datos...');

  const seedDir = path.join(process.cwd(), 'data', 'seed');
  const seedFiles = fs.readdirSync(seedDir).filter((f) => f.endsWith('.seed.json'));

  for (const file of seedFiles) {
    const filePath = path.join(seedDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    console.log(`Procesando seed: ${file}`);

    // TODO: Implementar inserción en la base de datos
    // Ejemplo para projects.seed.json:
    // if (data.projects) {
    //   for (const project of data.projects) {
    //     await db.insert(projects).values(project).onConflictDoNothing()
    //   }
    // }
  }

  console.log('seed-db: pendiente de implementación completa');
  console.log(`Seeds encontrados: ${seedFiles.join(', ')}`);
}

main().catch(console.error);
