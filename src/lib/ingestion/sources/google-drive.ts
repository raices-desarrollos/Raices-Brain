// Conector de ingesta desde Google Drive
// Sincroniza documentos desde una carpeta de Google Drive a la base vectorial

export interface GoogleDriveSyncOptions {
  folderId: string; // ID de la carpeta raíz de Drive a sincronizar
  since?: Date; // solo archivos modificados desde esta fecha
  includeSubfolders?: boolean; // default: true
}

export interface GoogleDriveSyncResult {
  filesProcessed: number;
  documentsIndexed: number;
  documentsSkipped: number;
  errors: string[];
}

/**
 * Sincroniza documentos desde Google Drive.
 * @param options Opciones de sincronización
 */
export async function syncFromGoogleDrive(
  options: GoogleDriveSyncOptions,
): Promise<GoogleDriveSyncResult> {
  // TODO:
  // 1. Autenticar con Google Drive API usando OAuth2 (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN)
  // 2. Listar archivos en la carpeta especificada
  // 3. Filtrar por fecha 'since' si se provee
  // 4. Para cada archivo (Google Docs, PDF, etc.):
  //    a. Exportar como texto plano (Docs → text/plain, PDF → extraer texto)
  //    b. Llamar a indexDocument con source: 'google-drive'
  // 5. Retornar stats del proceso

  throw new Error('syncFromGoogleDrive: pendiente de implementación');
}
