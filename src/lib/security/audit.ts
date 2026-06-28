// Auditoría de consultas a agentes
// Registra el log de uso de los agentes para monitoreo y seguridad

export interface AuditEntry {
  id: string;
  timestamp: Date;
  agentSlug: string;
  userRole?: string;
  query: string;
  queryLength: number;
  documentsRetrieved: number;
  responseLength: number;
  latencyMs: number;
}

/**
 * Registra una consulta a un agente en el log de auditoría.
 * @param entry Los datos de la consulta a registrar
 */
export async function logAuditEntry(entry: Omit<AuditEntry, 'id' | 'timestamp'>): Promise<void> {
  // TODO: Implementar persistencia del log de auditoría
  // Opciones: base de datos, archivo de log, servicio externo (Datadog, etc.)

  const fullEntry: AuditEntry = {
    id: crypto.randomUUID(),
    timestamp: new Date(),
    ...entry,
  };

  // Por ahora: solo log en consola (reemplazar con persistencia real)
  console.log(
    '[AUDIT]',
    JSON.stringify({
      ...fullEntry,
      query: fullEntry.query.slice(0, 100) + (fullEntry.query.length > 100 ? '...' : ''),
    }),
  );
}

/**
 * Placeholder: retorna las últimas N entradas del log de auditoría.
 * TODO: Implementar consulta a la base de datos
 */
export async function getRecentAuditEntries(limit: number = 50): Promise<AuditEntry[]> {
  // TODO: Implementar consulta real
  return [];
}
