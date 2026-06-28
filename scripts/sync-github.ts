#!/usr/bin/env tsx
// Script: sync-github.ts
// Sincroniza el knowledge base desde el repositorio de GitHub a la base vectorial

// TODO: Implementar usando src/lib/ingestion/sources/github.ts

async function main() {
  console.log('Iniciando sincronización desde GitHub...');

  // TODO:
  // const result = await syncFromGitHub({
  //   repo: process.env.GITHUB_REPO ?? 'raices-desarrollos/raices-brain',
  //   branch: 'main',
  //   paths: ['knowledge/', 'agents/', 'docs/'],
  // })
  // console.log(`Sincronización completa: ${result.documentsIndexed} documentos indexados`)

  console.log('sync-github: pendiente de implementación');
}

main().catch(console.error);
