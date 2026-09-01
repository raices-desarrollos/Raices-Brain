import { extractInvoiceFromFile } from '@/lib/invoices/extract';
import { requireAuth } from '@/lib/auth/server';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { response } = await requireAuth();
  if (response) return response;

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'Archivo requerido.' }, { status: 400 });

  const result = await extractInvoiceFromFile(file);
  return NextResponse.json(result);
}
