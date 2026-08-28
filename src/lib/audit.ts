import { db } from '@/lib/db';
import { auditLog } from '@/lib/db/schema';
import { randomUUID } from 'crypto';

export async function audit(
  userId: string | null,
  action: string,
  entity: string,
  entityId?: string,
  details?: string,
  ip?: string,
) {
  try {
    await db.insert(auditLog).values({
      id: randomUUID(),
      userId,
      action,
      entity,
      entityId,
      details,
      ip,
    });
  } catch {
    // Audit failures must never break business operations
  }
}
