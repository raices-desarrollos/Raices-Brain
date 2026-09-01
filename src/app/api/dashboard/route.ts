import { requireAuth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { documents, invoices, payments } from '@/lib/db/schema';
import { getCatalogProject } from '@/lib/domain/catalog';
import { desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  const { response } = await requireAuth();
  if (response) return response;

  const project = getCatalogProject('ceibo-vidal');
  const slug = 'ceibo-vidal';

  let invoiceRows: typeof invoices.$inferSelect[] = [];
  let paymentRows: typeof payments.$inferSelect[] = [];
  let recentDocs: {
    id: string;
    name: string;
    category: string;
    createdAt: Date | null;
    driveWebViewLink: string | null;
  }[] = [];

  try {
    invoiceRows = await db.select().from(invoices).where(eq(invoices.projectRef, slug));
  } catch {
    invoiceRows = [];
  }
  try {
    paymentRows = await db.select().from(payments).where(eq(payments.projectRef, slug));
  } catch {
    paymentRows = [];
  }
  try {
    recentDocs = await db
      .select({
        id: documents.id,
        name: documents.name,
        category: documents.category,
        createdAt: documents.createdAt,
        driveWebViewLink: documents.driveWebViewLink,
      })
      .from(documents)
      .orderBy(desc(documents.createdAt))
      .limit(8);
  } catch {
    recentDocs = [];
  }

  const active = invoiceRows.filter((i) => i.status !== 'anulada');
  const pending = active.filter((i) => i.status === 'pendiente' || i.status === 'parcial');
  const paidInvoices = active.filter((i) => i.status === 'pagada');
  const paidPayments = paymentRows.filter((p) => p.status === 'pagado');
  const currency = active[0]?.currency ?? paidPayments[0]?.currency ?? 'ARS';

  return NextResponse.json({
    project,
    invoiced: {
      count: active.length,
      amount: active.reduce((a, i) => a + (i.amount ?? 0), 0),
      currency,
    },
    invoicesPending: {
      count: pending.length,
      amount: pending.reduce((a, i) => a + (i.amount ?? 0), 0),
      currency,
    },
    paid: {
      count: paidPayments.length || paidInvoices.length,
      amount:
        paidPayments.length > 0
          ? paidPayments.reduce((a, p) => a + p.amount, 0)
          : paidInvoices.reduce((a, i) => a + (i.amount ?? 0), 0),
      currency,
    },
    recentDocuments: recentDocs,
  });
}
