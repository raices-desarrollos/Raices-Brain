import { audit } from '@/lib/audit';
import { getUserId, requireAuth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { invoices, payments } from '@/lib/db/schema';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { session, response } = await requireAuth();
  if (response) return response;

  const { id } = await params;
  const body = await req.json();
  const userId = getUserId(session);

  const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
  if (!invoice) return NextResponse.json({ error: 'No encontrada' }, { status: 404 });
  if (invoice.status === 'pagada' && invoice.paymentId) {
    return NextResponse.json({ error: 'Esta factura ya está pagada.' }, { status: 400 });
  }

  const paidDate = String(body.paidDate ?? '').trim() || new Date().toISOString().slice(0, 10);
  const amount = Number(body.amount ?? invoice.amount);
  const method = String(body.method ?? 'transferencia');
  const observations = String(body.observations ?? '').trim() || null;

  if (!amount || Number.isNaN(amount)) {
    return NextResponse.json({ error: 'Monto inválido.' }, { status: 400 });
  }

  const paymentId = randomUUID();
  const [payment] = await db
    .insert(payments)
    .values({
      id: paymentId,
      concept: invoice.concept || `Pago factura ${invoice.number || invoice.supplierName}`,
      amount,
      currency: invoice.currency,
      type: 'egreso',
      category: invoice.category || 'otro',
      dueDate: invoice.dueDate,
      paidDate,
      status: 'pagado',
      method,
      projectRef: invoice.projectRef,
      invoiceId: invoice.id,
      observations,
      documentId: invoice.documentId,
      createdBy: userId,
      updatedBy: userId,
    })
    .returning();

  const [updated] = await db
    .update(invoices)
    .set({
      status: 'pagada',
      paymentId,
      updatedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(invoices.id, id))
    .returning();

  await audit(userId, 'create', 'payment', paymentId, `Factura ${invoice.supplierName}`);
  return NextResponse.json({ invoice: updated, payment });
}
