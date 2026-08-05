import { requireAuth } from '@/lib/auth/server';
import { db } from '@/lib/db';
import { documentSyncs, importCandidates, meetings } from '@/lib/db/schema';
import { createHash, randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

// ─── Google auth ──────────────────────────────────────────────────────────────

function getDriveClient() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } = process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN) return null;
  const auth = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);
  auth.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });
  return google.drive({ version: 'v3', auth });
}

// ─── Parsing ──────────────────────────────────────────────────────────────────

const DATE_PATTERNS = [
  /\b(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+de\s+(\d{4})\b/gi,
  /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g,
  /\b(\d{4})-(\d{2})-(\d{2})\b/g,
];

const MONTH_MAP: Record<string, string> = {
  enero: '01',
  febrero: '02',
  marzo: '03',
  abril: '04',
  mayo: '05',
  junio: '06',
  julio: '07',
  agosto: '08',
  septiembre: '09',
  octubre: '10',
  noviembre: '11',
  diciembre: '12',
};

function extractDateFromText(text: string): string | null {
  // Spanish format: "5 de agosto de 2026"
  const m = text.match(
    /(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+de\s+(\d{4})/i,
  );
  if (m) {
    const day = m[1].padStart(2, '0');
    const month = MONTH_MAP[m[2].toLowerCase()];
    return `${m[3]}-${month}-${day}`;
  }
  // ISO or DD/MM/YYYY
  const iso = text.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return iso[0];
  const dmy = text.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  return null;
}

interface ParsedBlock {
  meetingDate: string;
  rawSection: string;
  bullets: string[];
}

function parseDocText(text: string): ParsedBlock[] {
  const lines = text.split('\n');
  const blocks: ParsedBlock[] = [];
  let currentDate: string | null = null;
  let currentBullets: string[] = [];
  let currentLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const date = extractDateFromText(trimmed);
    // A line IS a date header if it's short (< 60 chars) and contains a date
    if (date && trimmed.length < 60 && !trimmed.startsWith('-')) {
      if (currentDate && currentBullets.length > 0) {
        blocks.push({
          meetingDate: currentDate,
          rawSection: currentLines.join('\n'),
          bullets: currentBullets,
        });
      }
      currentDate = date;
      currentBullets = [];
      currentLines = [trimmed];
    } else if (currentDate && (trimmed.startsWith('- ') || trimmed.startsWith('• '))) {
      const bullet = trimmed.replace(/^[-•]\s*/, '').trim();
      if (bullet.length > 3) {
        currentBullets.push(bullet);
        currentLines.push(trimmed);
      }
    } else if (currentDate) {
      currentLines.push(trimmed);
    }
  }

  if (currentDate && currentBullets.length > 0) {
    blocks.push({
      meetingDate: currentDate,
      rawSection: currentLines.join('\n'),
      bullets: currentBullets,
    });
  }

  return blocks;
}

function importHash(docId: string, text: string): string {
  const normalized = text.toLowerCase().replace(/\s+/g, ' ').trim();
  return createHash('sha256').update(`${docId}::${normalized}`).digest('hex').slice(0, 32);
}

// ─── AI classification ────────────────────────────────────────────────────────

interface AiResult {
  type: 'TASK' | 'DECISION' | 'NOTE' | 'AMBIGUOUS';
  cleanTitle: string;
  assignee: string | null;
  projectRef: string | null;
  notes: string | null;
}

async function classifyBullets(
  bullets: string[],
  meetingDate: string,
  context: string,
): Promise<AiResult[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return bullets.map((b) => ({
      type: 'TASK' as const,
      cleanTitle: b,
      assignee: extractAssignee(b),
      projectRef: null,
      notes: null,
    }));
  }

  const prompt = `Sos un asistente que analiza notas de reuniones de una empresa inmobiliaria argentina.
Fecha de la reunión: ${meetingDate}
Contexto adicional: ${context.slice(0, 500)}

Para cada item, respondé en JSON con esta estructura exacta:
{
  "items": [
    {
      "type": "TASK|DECISION|NOTE",
      "cleanTitle": "título accionable y claro, máx 80 chars",
      "assignee": "nombre detectado o null",
      "projectRef": "proyecto detectado o null",
      "notes": "observación breve si hay ambigüedad, o null"
    }
  ]
}

Reglas:
- TASK: algo que alguien tiene que hacer (verbo de acción: consultar, hablar, revisar, enviar...)
- DECISION: conclusión o acuerdo del equipo (se decidió, se acordó, el precio será...)
- NOTE: información general, contexto, sin acción ni decisión clara
- cleanTitle: convertí frases informales a verbos imperativos: "Darío tiene que llamar a X" → "Llamar a X"
- assignee: solo si está explícito ("— Darío", "Pascual", etc.), nunca inventes
- No cambies el significado de la tarea

Items a clasificar:
${bullets.map((b, i) => `${i + 1}. ${b}`).join('\n')}`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    return bullets.map((b) => ({
      type: 'TASK' as const,
      cleanTitle: b,
      assignee: extractAssignee(b),
      projectRef: null,
      notes: null,
    }));
  }

  const data = await res.json();
  try {
    const parsed = JSON.parse(data.choices[0].message.content);
    return parsed.items as AiResult[];
  } catch {
    return bullets.map((b) => ({
      type: 'TASK' as const,
      cleanTitle: b,
      assignee: extractAssignee(b),
      projectRef: null,
      notes: null,
    }));
  }
}

function extractAssignee(text: string): string | null {
  // Common patterns: "— Darío", "– Pascual", "(Darío)"
  const dash = text.match(/[—–-]\s*([A-ZÁÉÍÓÚa-záéíóú][a-záéíóú]+)\s*$/);
  if (dash) return dash[1];
  const paren = text.match(/\(([A-ZÁÉÍÓÚa-záéíóú][a-záéíóú]+)\)/);
  if (paren) return paren[1];
  return null;
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { response } = await requireAuth();
  if (response) return response;

  const { docId } = await req.json();
  if (!docId?.trim()) {
    return NextResponse.json({ error: 'docId requerido' }, { status: 400 });
  }

  const drive = getDriveClient();
  if (!drive) {
    return NextResponse.json(
      {
        error:
          'Credenciales de Google no configuradas. Agregá GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET y GOOGLE_REFRESH_TOKEN en .env.local.',
      },
      { status: 400 },
    );
  }

  // Get doc metadata
  let docTitle = 'Documento sin título';
  try {
    const meta = await drive.files.get({ fileId: docId, fields: 'name' });
    docTitle = meta.data.name ?? docTitle;
  } catch {}

  // Export as plain text
  let docText = '';
  try {
    const exportRes = await drive.files.export(
      { fileId: docId, mimeType: 'text/plain' },
      { responseType: 'text' },
    );
    docText = exportRes.data as string;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    await db.insert(documentSyncs).values({
      id: randomUUID(),
      docId,
      docTitle,
      lastSyncAt: new Date(),
      lastSyncStatus: 'error',
      lastSyncError: msg,
      candidatesFound: 0,
    });
    return NextResponse.json({ error: `No se pudo leer el documento: ${msg}` }, { status: 500 });
  }

  // Parse document into meeting blocks + bullets
  const blocks = parseDocText(docText);
  let totalNew = 0;

  for (const block of blocks) {
    // Upsert meeting record
    const meetingId = randomUUID();
    const existingMeeting = await db
      .select()
      .from(meetings)
      .where(eq(meetings.docId, docId))
      .then((rows) => rows.find((r) => r.meetingDate === block.meetingDate));

    const resolvedMeetingId = existingMeeting?.id ?? meetingId;
    if (!existingMeeting) {
      await db.insert(meetings).values({
        id: meetingId,
        docId,
        docTitle,
        meetingDate: block.meetingDate,
        rawSection: block.rawSection,
      });
    }

    // Classify bullets with AI
    const aiResults = await classifyBullets(block.bullets, block.meetingDate, block.rawSection);

    for (let i = 0; i < block.bullets.length; i++) {
      const bullet = block.bullets[i];
      const ai = aiResults[i] ?? {
        type: 'TASK',
        cleanTitle: bullet,
        assignee: null,
        projectRef: null,
        notes: null,
      };

      // Skip pure notes (not tasks or decisions)
      if (ai.type === 'NOTE') continue;

      const hash = importHash(docId, bullet);

      // Check for existing candidate
      const existing = await db
        .select()
        .from(importCandidates)
        .where(eq(importCandidates.importHash, hash))
        .limit(1);
      if (existing.length > 0) continue; // already imported

      await db.insert(importCandidates).values({
        id: randomUUID(),
        docId,
        docTitle,
        meetingDate: block.meetingDate,
        originalText: bullet,
        suggestedTitle: ai.cleanTitle,
        aiType: ai.type,
        aiAssignee: ai.assignee,
        aiProjectRef: ai.projectRef,
        aiNotes: ai.notes,
        importHash: hash,
        status: 'PENDING',
        syncedAt: new Date(),
      });
      totalNew++;
    }
  }

  // Record sync
  await db.insert(documentSyncs).values({
    id: randomUUID(),
    docId,
    docTitle,
    lastSyncAt: new Date(),
    lastSyncStatus: 'ok',
    candidatesFound: totalNew,
  });

  return NextResponse.json({
    ok: true,
    docTitle,
    meetingsFound: blocks.length,
    newCandidates: totalNew,
  });
}

export async function GET(_req: NextRequest) {
  const { response } = await requireAuth();
  if (response) return response;

  const syncs = await db.select().from(documentSyncs).orderBy(documentSyncs.createdAt);
  return NextResponse.json(syncs);
}
