import { audit } from '@/lib/audit';
import { getUserId, requireAuth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { documents, invoices } from '@/lib/db/schema';
import { uploadInvoiceToDrive, isDriveConfigured } from '@/lib/google/drive';
import { storeFile } from '@/lib/storage';
import { randomUUID } from 'crypto';
import { and, desc, eq, ilike } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';

export async function GET(req: NextRequest) {
  const { response } = await requireAuth();
  if (response) return response;

  const project = req.nextUrl.searchParams.get('project') ?? '';
  const supplier = req.nextUrl.searchParams.get('supplier') ?? '';
  const status = req.nextUrl.searchParams.get('status') ?? '';

  try {
    const filters = [];
    if (project) filters.push(ilike(invoices.projectRef, `%${project}%`));
    if (supplier) filters.push(ilike(invoices.supplierName, `%${supplier}%`));
    if (status) filters.push(eq(invoices.status, status));

    const rows = await db
      .select()
      .from(invoices)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(desc(invoices.createdAt));

    return NextResponse.json(rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        error:
          'La tabla de facturas no está disponible. Ejecutá `npm run db:migrate` para crearla.',
      },
      { status: 503 },
    );
  }
}

export async function POST(req: NextRequest) {
  const { session, response } = await requireAuth();
  if (response) return response;

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const supplierName = String(formData.get('supplierName') ?? '').trim();
  const amount = Number(formData.get('amount'));
  const currency = String(formData.get('currency') ?? 'ARS');
  const concept = String(formData.get('concept') ?? '').trim();
  const category = String(formData.get('category') ?? 'otro');
  const status = String(formData.get('status') ?? 'pendiente');
  const projectRef = String(formData.get('projectRef') ?? '').trim() || 'ceibo-vidal';
  const issueDate = String(formData.get('issueDate') ?? '') || null;
  const dueDate = String(formData.get('dueDate') ?? '') || null;
  const number = String(formData.get('number') ?? '').trim() || null;
  const cuit = String(formData.get('cuit') ?? '').trim() || null;
  const subtotalRaw = formData.get('subtotal');
  const subtotal = subtotalRaw ? Number(subtotalRaw) : null;
  const taxAmountRaw = formData.get('taxAmount');
  const taxAmount = taxAmountRaw ? Number(taxAmountRaw) : null;
  const notes = String(formData.get('notes') ?? '').trim() || null;

  if (!supplierName) {
    return NextResponse.json({ error: 'El proveedor es obligatorio.' }, { status: 400 });
  }
  if (!amount || Number.isNaN(amount)) {
    return NextResponse.json({ error: 'El monto es obligatorio.' }, { status: 400 });
  }

  const userId = getUserId(session);
  const id = randomUUID();
  let documentId: string | null = null;
  let driveFileId: string | null = null;
  let driveWebViewLink: string | null = null;
  let storageKey = 'invoice-no-file';

  let folderPath: string | null = null;

  if (file && file.size > 0) {
    const bytes = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadInvoiceToDrive({
      name: file.name,
      mimeType: file.type || 'application/octet-stream',
      body: bytes,
      projectSlug: projectRef,
    });
    if (uploaded) {
      driveFileId = uploaded.id;
      driveWebViewLink = uploaded.webViewLink;
      folderPath = uploaded.folderPath;
      storageKey = `drive:${uploaded.id}`;
    } else if (process.env.NODE_ENV === 'production' && isDriveConfigured()) {
      return NextResponse.json(
        { error: 'No se pudo guardar el archivo en Google Drive. Reintentá.' },
        { status: 502 },
      );
    } else if (!isDriveConfigured() && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Google Drive no está conectado. No se puede guardar el archivo de la factura.' },
        { status: 502 },
      );
    } else {
      storageKey = await storeFile(Readable.from(bytes), file.name, file.type);
    }

    const [doc] = await db
      .insert(documents)
      .values({
        id: randomUUID(),
        name: file.name,
        description: concept || `Factura ${supplierName}`,
        category: 'factura',
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        storageKey,
        projectRef,
        driveFileId,
        driveWebViewLink,
        folderPath: folderPath ?? (driveFileId ? 'Ceibo Vidal / Facturas' : null),
        createdBy: userId,
      })
      .returning();
    documentId = doc.id;
    await audit(userId, 'upload', 'document', documentId, file.name);
  }

  try {
    const [row] = await db
      .insert(invoices)
      .values({
        id,
        number,
        supplierName,
        cuit,
        projectRef,
        issueDate,
        dueDate,
        amount,
        subtotal,
        taxAmount,
        currency,
        concept: concept || null,
        category,
        status,
        documentId,
        driveFileId,
        driveWebViewLink,
        notes,
        createdBy: userId,
        updatedBy: userId,
      })
      .returning();

    await audit(userId, 'create', 'invoice', id, supplierName);
    return NextResponse.json(row, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        error:
          'No se pudo guardar la factura. Si es la primera vez, ejecutá `npm run db:migrate`.',
      },
      { status: 503 },
    );
  }
}
