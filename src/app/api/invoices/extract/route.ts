import { extractInvoiceFromFile } from '@/lib/invoices/extract';
import { requireAuth } from '@/lib/auth/server';
import { validateInvoiceFile } from '@/lib/uploads';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { response } = await requireAuth();
  if (response) return response;

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'Archivo requerido.' }, { status: 400 });

  const invalid = validateInvoiceFile(file);
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

  try {
    const result = await extractInvoiceFromFile(file);
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'No se pudo leer la factura. Reintentá con otro archivo.' }, { status: 500 });
  }
}
