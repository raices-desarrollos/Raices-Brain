// Conector de ingesta desde GitHub
// Sincroniza documentos desde el repositorio de GitHub a la base vectorial

export interface GitHubSyncOptions {
  repo: string; // ej: raices-desarrollos/raices-brain
  branch?: string; // default: main
  paths?: string[]; // paths a sincronizar, default: ['knowledge/', 'agents/', 'docs/']
  since?: Date; // solo archivos modificados desde esta fecha
}

export interface GitHubSyncResult {
  filesProcessed: number;
  documentsIndexed: number;
  documentsSkipped: number;
  errors: string[];
}

/**
 * Sincroniza documentos desde un repositorio de GitHub.
 * @param options Opciones de sincronización
 */
export async function syncFromGitHub(options: GitHubSyncOptions): Promise<GitHubSyncResult> {
  // TODO:
  // 1. Autenticar con GitHub API usando GITHUB_TOKEN
  // 2. Listar archivos en los paths especificados
  // 3. Filtrar por fecha 'since' si se provee
  // 4. Para cada archivo .md o .json:
  //    a. Descargar contenido via GitHub API
  //    b. Llamar a indexDocument con source: 'github'
  // 5. Retornar stats del proceso

  throw new Error('syncFromGitHub: pendiente de implementación');
}
