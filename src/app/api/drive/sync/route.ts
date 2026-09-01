import { generateEmbedding } from '@/lib/ai/embeddings';
import { getUserId, requireAuth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { financialSnapshots } from '@/lib/db/schema';
import { getDriveClient } from '@/lib/google/drive';
import { randomUUID } from 'crypto';
import { sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export const maxDuration = 60;

export interface FinancialKPIs {
  gastosTotal: number | null;
  ingresosTotal: number | null;
  gananciaEsperada: number | null;
  presupuestoTotal: number | null;
  porcentajeEjecutado: number | null;
  roi: number | null;
  currency: string;
  resumen: string;
  detalles: Record<string, number | string>;
}

const GOOGLE_DRIVE_MIMES = {
  FOLDER: 'application/vnd.google-apps.folder',
  SHEETS: 'application/vnd.google-apps.spreadsheet',
  DOCS: 'application/vnd.google-apps.document',
};

const EXCEL_MIMES = new Set([
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

// Convierte hojas de un workbook a texto plano con tabla markdown por hoja
function workbookToText(workbook: XLSX.WorkBook): string {
  const sections: string[] = [];
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: '',
      raw: false,
    });
    if (rows.length === 0) continue;
    const headers = Object.keys(rows[0]);
    const headerRow = `| ${headers.join(' | ')} |`;
    const sep = `| ${headers.map(() => '---').join(' | ')} |`;
    const dataRows = rows
      .slice(0, 200) // limitar a 200 filas para no exceder context window
      .map((r) => `| ${headers.map((h) => String(r[h] ?? '').trim()).join(' | ')} |`);
    sections.push(`### Hoja: ${sheetName}\n\n${[headerRow, sep, ...dataRows].join('\n')}`);
  }
  return sections.join('\n\n');
}

// Usa GPT-4o para extraer KPIs financieros del texto de un Excel
async function extractKPIs(fileName: string, tableText: string): Promise<FinancialKPIs> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      gastosTotal: null,
      ingresosTotal: null,
      gananciaEsperada: null,
      presupuestoTotal: null,
      porcentajeEjecutado: null,
      roi: null,
      currency: 'USD',
      resumen: 'Sin clave OpenAI para extracción',
      detalles: {},
    };
  }

  const prompt = `Sos un analista financiero. Analizá este archivo Excel llamado "${fileName}" de una empresa inmobiliaria y extraé los KPIs financieros más relevantes.

Respondé ÚNICAMENTE con un JSON válido con esta estructura exacta (usá null si no encontrás el dato):
{
  "gastosTotal": <número total de gastos/egresos, null si no disponible>,
  "ingresosTotal": <número total de ingresos/ventas, null si no disponible>,
  "gananciaEsperada": <ganancia o utilidad esperada/proyectada, null si no disponible>,
  "presupuestoTotal": <presupuesto total del proyecto, null si no disponible>,
  "porcentajeEjecutado": <porcentaje ejecutado del presupuesto 0-100, null si no disponible>,
  "roi": <retorno sobre inversión en porcentaje, null si no disponible>,
  "currency": <"USD" o "ARS" según la moneda predominante>,
  "resumen": <1 oración resumiendo qué contiene este archivo>,
  "detalles": <objeto con hasta 8 métricas adicionales relevantes encontradas, claves descriptivas en español>
}

Datos del archivo:
${tableText.slice(0, 8000)}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    return {
      gastosTotal: null,
      ingresosTotal: null,
      gananciaEsperada: null,
      presupuestoTotal: null,
      porcentajeEjecutado: null,
      roi: null,
      currency: 'USD',
      resumen: 'Error al extraer KPIs',
      detalles: {},
    };
  }

  const data = await response.json();
  try {
    return JSON.parse(data.choices[0].message.content) as FinancialKPIs;
  } catch {
    return {
      gastosTotal: null,
      ingresosTotal: null,
      gananciaEsperada: null,
      presupuestoTotal: null,
      porcentajeEjecutado: null,
      roi: null,
      currency: 'USD',
      resumen: 'Error al parsear respuesta',
      detalles: {},
    };
  }
}

export async function POST(_req: NextRequest) {
  const { session, response } = await requireAuth();
  if (response) return response;

  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) {
    return NextResponse.json({ error: 'Drive no está configurado.' }, { status: 400 });
  }

  const drive = getDriveClient();
  if (!drive) {
    return NextResponse.json(
      {
        error: 'Drive no está conectado. Pedile a quien administra la app que lo revise.',
      },
      { status: 400 },
    );
  }

  const userId = getUserId(session);
  const results: { file: string; kpis: FinancialKPIs | null; chunksIngested: number }[] = [];

  // Listar archivos en la carpeta
  const listRes = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType)',
    pageSize: 100,
  });

  const files = listRes.data.files ?? [];

  for (const file of files) {
    const { id: fileId, name, mimeType } = file;
    if (!fileId || !name || !mimeType) continue;

    let workbook: XLSX.WorkBook | null = null;
    let tableText = '';

    if (mimeType === GOOGLE_DRIVE_MIMES.SHEETS) {
      // Google Sheets → exportar como xlsx
      const exportRes = await drive.files.export(
        { fileId, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
        { responseType: 'arraybuffer' },
      );
      workbook = XLSX.read(Buffer.from(exportRes.data as ArrayBuffer), { type: 'buffer' });
    } else if (EXCEL_MIMES.has(mimeType)) {
      // Archivo .xlsx/.xls descargado
      const downloadRes = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'arraybuffer' },
      );
      workbook = XLSX.read(Buffer.from(downloadRes.data as ArrayBuffer), { type: 'buffer' });
    } else if (mimeType === GOOGLE_DRIVE_MIMES.DOCS) {
      // Google Docs → exportar como texto plano e ingestar en RAG
      const exportRes = await drive.files.export(
        { fileId, mimeType: 'text/plain' },
        { responseType: 'text' },
      );
      const docText = exportRes.data as string;
      const filePath = `drive/${name}.md`;

      await db.execute(sql`DELETE FROM knowledge_chunks WHERE file_path = ${filePath}`);

      const sections = docText.split(/\n(?=#{1,2} )/);
      let chunksIngested = 0;
      for (const section of sections) {
        const lines = section.trim().split('\n');
        const heading = lines[0]?.replace(/^#+\s*/, '').trim() || name;
        const body = lines.slice(1).join('\n').trim();
        if (body.length < 80) continue;

        const { embedding } = await generateEmbedding(`${heading}\n\n${body}`);
        const vectorLiteral = `[${embedding.join(',')}]`;
        await db.execute(
          sql`INSERT INTO knowledge_chunks (id, file_path, heading, content, embedding)
              VALUES (${randomUUID()}, ${filePath}, ${heading}, ${body}, ${vectorLiteral}::vector)`,
        );
        chunksIngested++;
      }
      results.push({ file: name, kpis: null, chunksIngested });
      continue;
    } else {
      continue; // ignorar PDFs e imágenes por ahora
    }

    if (!workbook) continue;
    tableText = workbookToText(workbook);

    // Ingestar en RAG
    const filePath = `drive/${name}`;
    await db.execute(sql`DELETE FROM knowledge_chunks WHERE file_path = ${filePath}`);
    let chunksIngested = 0;
    for (const sheetName of workbook.SheetNames) {
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[sheetName], {
        defval: '',
        raw: false,
      });
      if (rows.length === 0) continue;
      const headers = Object.keys(rows[0]);
      const content = `Archivo: ${name}\nHoja: ${sheetName}\n\n${workbookToText({ SheetNames: [sheetName], Sheets: workbook.Sheets })}`;
      const heading = `${name} — ${sheetName}`;
      const { embedding } = await generateEmbedding(`${heading}\n\n${content.slice(0, 3000)}`);
      const vectorLiteral = `[${embedding.join(',')}]`;
      await db.execute(
        sql`INSERT INTO knowledge_chunks (id, file_path, heading, content, embedding)
            VALUES (${randomUUID()}, ${filePath}, ${heading}, ${content}, ${vectorLiteral}::vector)`,
      );
      chunksIngested++;
    }

    // Extraer KPIs financieros
    const kpis = await extractKPIs(name, tableText);

    // Guardar snapshot (reemplazar el anterior del mismo archivo)
    await db.execute(sql`DELETE FROM financial_snapshots WHERE source = ${name}`);
    await db.insert(financialSnapshots).values({
      id: randomUUID(),
      source: name,
      driveFileId: fileId,
      kpis,
    });

    results.push({ file: name, kpis, chunksIngested });
  }

  return NextResponse.json({ ok: true, synced: results.length, results });
}
