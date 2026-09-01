import { INVOICE_CATEGORIES } from '@/lib/domain/catalog';

export type InvoiceExtraction = {
  supplierName: string;
  cuit: string;
  number: string;
  issueDate: string;
  dueDate: string;
  subtotal: string;
  taxAmount: string;
  amount: string;
  currency: string;
  concept: string;
  category: string;
  projectRef: string;
  notes: string;
  extractionAvailable: boolean;
  extractionNote: string;
};

export const EMPTY_EXTRACTION: InvoiceExtraction = {
  supplierName: '',
  cuit: '',
  number: '',
  issueDate: '',
  dueDate: '',
  subtotal: '',
  taxAmount: '',
  amount: '',
  currency: 'ARS',
  concept: '',
  category: 'otro',
  projectRef: 'ceibo-vidal',
  notes: '',
  extractionAvailable: false,
  extractionNote: '',
};

const IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/jpg']);

const EXTRACT_PROMPT = `Extraé los datos de esta factura argentina de obra / proveedor.
Respondé SOLO JSON:
{
  "supplierName": string,
  "cuit": string o "",
  "number": string o "",
  "issueDate": "YYYY-MM-DD" o "",
  "dueDate": "YYYY-MM-DD" o "",
  "subtotal": number o "",
  "taxAmount": number o "",
  "amount": number o ""  // total,
  "currency": "ARS" o "USD",
  "concept": string,
  "category": uno de ${INVOICE_CATEGORIES.join(', ')},
  "projectRef": "ceibo-vidal" si menciona Ceibo o Vidal, si no "ceibo-vidal",
  "notes": string
}
Si un dato no está, string vacío. No inventes montos ni CUIT.`;

function normalize(parsed: Record<string, unknown>): InvoiceExtraction {
  const str = (k: string) => (parsed[k] != null && parsed[k] !== '' ? String(parsed[k]) : '');
  return {
    ...EMPTY_EXTRACTION,
    supplierName: str('supplierName'),
    cuit: str('cuit'),
    number: str('number'),
    issueDate: str('issueDate'),
    dueDate: str('dueDate'),
    subtotal: parsed.subtotal != null && parsed.subtotal !== '' ? String(parsed.subtotal) : '',
    taxAmount: parsed.taxAmount != null && parsed.taxAmount !== '' ? String(parsed.taxAmount) : '',
    amount: parsed.amount != null && parsed.amount !== '' ? String(parsed.amount) : '',
    currency: str('currency') || 'ARS',
    concept: str('concept'),
    category: INVOICE_CATEGORIES.includes(str('category') as (typeof INVOICE_CATEGORIES)[number])
      ? str('category')
      : 'otro',
    projectRef: str('projectRef') || 'ceibo-vidal',
    notes: str('notes'),
    extractionAvailable: true,
    extractionNote: 'Revisá los datos extraídos antes de confirmar.',
  };
}

async function callOpenAI(messages: unknown[]): Promise<InvoiceExtraction | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o',
      temperature: 0,
      response_format: { type: 'json_object' },
      messages,
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  try {
    return normalize(JSON.parse(data.choices?.[0]?.message?.content ?? '{}'));
  } catch {
    return null;
  }
}

export async function extractInvoiceFromFile(file: File): Promise<InvoiceExtraction> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      ...EMPTY_EXTRACTION,
      extractionNote: 'Falta OPENAI_API_KEY. Completá los datos a mano.',
    };
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const mime = file.type || 'application/octet-stream';

  if (IMAGE_MIMES.has(mime)) {
    const result = await callOpenAI([
      {
        role: 'user',
        content: [
          { type: 'text', text: EXTRACT_PROMPT },
          { type: 'image_url', image_url: { url: `data:${mime};base64,${bytes.toString('base64')}` } },
        ],
      },
    ]);
    return (
      result ?? {
        ...EMPTY_EXTRACTION,
        extractionNote: 'No se pudo leer la imagen. Completá los datos a mano.',
      }
    );
  }

  if (mime === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    let text = '';
    try {
      const { pdfToText } = await import('@/lib/pdf');
      text = await pdfToText(bytes);
    } catch {
      text = '';
    }

    if (!text) {
      return {
        ...EMPTY_EXTRACTION,
        concept: file.name.replace(/\.[^.]+$/, ''),
        extractionNote:
          'El PDF no tiene texto extraíble (puede ser un escaneo). Completá los datos a mano.',
      };
    }

    const result = await callOpenAI([
      {
        role: 'user',
        content: `${EXTRACT_PROMPT}\n\nNombre de archivo: ${file.name}\n\nTexto del PDF:\n${text.slice(0, 12000)}`,
      },
    ]);
    return (
      result ?? {
        ...EMPTY_EXTRACTION,
        concept: file.name.replace(/\.[^.]+$/, ''),
        extractionNote: 'No se pudo interpretar el PDF. Completá los datos a mano.',
      }
    );
  }

  return {
    ...EMPTY_EXTRACTION,
    concept: file.name.replace(/\.[^.]+$/, ''),
    extractionNote: 'Formato no soportado. Usá PDF, JPG o PNG.',
  };
}
