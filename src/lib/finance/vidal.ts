import { getDriveClient, listDriveFiles, resolveFinanzasFolder, type DriveFile } from '@/lib/google/drive';
import * as XLSX from 'xlsx';

/**
 * Lee las dos planillas de administración del proyecto en Drive
 * (Finanzas / "ADMINISTRACION FONDOS VIDAL" y "CUENTA SOCIOS") y arma los
 * números del tablero. Es un parser determinístico: no interviene el modelo de
 * lenguaje, así que los importes son exactamente los de la planilla.
 *
 * Convención de la planilla: la columna "USD Gastados" de la hoja MOVIMIENTOS
 * es el importe en USD equivalente de cada movimiento (los pagos en pesos ya
 * vienen convertidos al tipo de cambio de la fecha). Los aportes son positivos,
 * los egresos negativos.
 */

const FONDOS_PATTERN = /administracion\s+fondos/i;
const SOCIOS_PATTERN = /cuenta\s+socios/i;
const APORTES_RUBRO = /aporte\s+socios/i;
const LAND_RUBRO = /^terreno/i;

export type PartnerContribution = {
  /** Nombre completo tal como figura en CUENTA SOCIOS. */
  name: string;
  firstName: string;
  /** Aportado en USD equivalente. */
  usd: number;
  /** Parte aportada directamente en dólares. */
  usdDirect: number;
  /** Parte aportada en pesos, convertida a USD al TC de cada fecha. */
  arsConverted: number;
  /** Pesos nominales aportados. */
  arsNominal: number;
  movements: number;
  /** Proporción sobre el total aportado (0–1). */
  share: number;
  /** Compromiso de aporte inicial, de su cuenta corriente. */
  committed: number | null;
  /** Saldo pendiente según su cuenta corriente en CUENTA SOCIOS. */
  ledgerBalance: number | null;
};

export type LedgerLine = {
  category: string;
  usd: number;
  movements: number;
};

export type VidalFinance = {
  currency: 'USD';
  /** Leyenda de período de la planilla, ej. "MOVIMIENTOS HASTA JUNIO 2026". */
  periodLabel: string | null;
  lastMovementDate: string | null;
  partners: PartnerContribution[];
  contributions: {
    total: number;
    usdDirect: number;
    arsConverted: number;
    arsNominal: number;
    movements: number;
  };
  expenses: {
    total: number;
    land: number;
    other: number;
    lines: LedgerLine[];
    landLines: LedgerLine[];
    otherLines: LedgerLine[];
  };
  income: {
    total: number;
    lines: LedgerLine[];
  };
  capital: {
    committed: number | null;
    contributed: number;
    pending: number | null;
    /** Proporción del compromiso ya integrada (0–1). */
    progress: number | null;
  };
  cash: number;
  sources: { name: string; fileId: string; webViewLink: string | null; modifiedTime: string | null }[];
  warnings: string[];
  syncedAt: string;
};

// ─── Utilidades de planilla ──────────────────────────────────────────────────

type Row = unknown[];

function cellText(row: Row, index: number): string {
  if (index < 0) return '';
  const value = row[index];
  return value == null ? '' : String(value).trim();
}

function cellNumber(row: Row, index: number): number {
  if (index < 0) return 0;
  const value = row[index];
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const text = String(value ?? '').replace(/\s|\$|u\$s|usd/gi, '');
  if (!text) return 0;
  // La planilla usa formato es-AR en las celdas de texto: 1.234,56
  const normalized = text.includes(',') ? text.replace(/\./g, '').replace(',', '.') : text;
  const parsed = Number(normalized.replace(/[^\d.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function sheetRows(workbook: XLSX.WorkBook, sheetName: string): Row[] {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return [];
  return XLSX.utils.sheet_to_json<Row>(sheet, {
    header: 1,
    defval: '',
    raw: true,
    blankrows: false,
  });
}

function findSheet(workbook: XLSX.WorkBook, pattern: RegExp): string | null {
  return workbook.SheetNames.find((name) => pattern.test(name)) ?? null;
}

/** Índices de columna a partir de la fila de encabezado. */
function headerIndex(rows: Row[], labels: RegExp[]): { row: number; index: Record<string, number> } | null {
  for (let r = 0; r < Math.min(rows.length, 20); r++) {
    const cells = rows[r].map((c) => String(c ?? '').trim());
    if (labels.every((label) => cells.some((c) => label.test(c)))) {
      const index: Record<string, number> = {};
      labels.forEach((label) => {
        index[label.source] = cells.findIndex((c) => label.test(c));
      });
      return { row: r, index };
    }
  }
  return null;
}

/** Serial de Excel (sistema 1900) a ISO date. */
function excelSerialToISO(serial: number): string | null {
  if (!Number.isFinite(serial) || serial < 20000 || serial > 90000) return null;
  const ms = (serial - 25569) * 86_400_000;
  const date = new Date(ms);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

// ─── Hoja MOVIMIENTOS ────────────────────────────────────────────────────────

type Movement = {
  rubro: string;
  detail: string;
  date: string | null;
  usd: number;
  ars: number;
  usdOwn: number;
};

function parseMovements(workbook: XLSX.WorkBook): { movements: Movement[]; warnings: string[] } {
  const warnings: string[] = [];
  const sheetName = findSheet(workbook, /movimiento/i);
  if (!sheetName) {
    return { movements: [], warnings: ['La planilla de fondos no tiene una hoja MOVIMIENTOS.'] };
  }

  const rows = sheetRows(workbook, sheetName);
  const header = headerIndex(rows, [/^USD Gastados$/i, /^Detalle$/i, /^Fecha$/i]);
  if (!header) {
    return {
      movements: [],
      warnings: ['No se encontró la columna "USD Gastados" en MOVIMIENTOS.'],
    };
  }

  const iUsd = header.index['^USD Gastados$'];
  const iDetail = header.index['^Detalle$'];
  const iDate = header.index['^Fecha$'];
  const cells = rows[header.row].map((c) => String(c ?? '').trim());
  const iUsdOwn = cells.findIndex((c) => /^Importe u\$s$/i.test(c));
  const iArs = cells.findIndex((c) => /^Importe \$$/i.test(c));

  const movements: Movement[] = [];
  for (const row of rows) {
    // Las filas de movimiento son las únicas con el rubro en la primera columna;
    // los encabezados y subtotales que repite la planilla la dejan vacía.
    const rubro = cellText(row, 0);
    if (!rubro || /^rubro$/i.test(rubro)) continue;

    const usd = cellNumber(row, iUsd);
    const ars = cellNumber(row, iArs);
    const usdOwn = cellNumber(row, iUsdOwn);
    if (!usd && !ars && !usdOwn) continue;

    const serial = cellNumber(row, iDate);
    movements.push({
      rubro,
      detail: cellText(row, iDetail),
      date: excelSerialToISO(serial),
      usd,
      ars,
      usdOwn,
    });
  }

  if (!movements.length) warnings.push('La hoja MOVIMIENTOS no tiene filas legibles.');
  return { movements, warnings };
}

function parsePeriodLabel(workbook: XLSX.WorkBook): string | null {
  const sheetName = findSheet(workbook, /caratula|carátula/i);
  if (!sheetName) return null;
  for (const row of sheetRows(workbook, sheetName).slice(0, 8)) {
    const text = cellText(row, 0);
    if (/movimientos\s+hasta/i.test(text)) return text;
  }
  return null;
}

// ─── Libro CUENTA SOCIOS ─────────────────────────────────────────────────────

type PartnerLedger = { name: string; committed: number | null; balance: number | null };

function parsePartnerLedgers(workbook: XLSX.WorkBook): {
  ledgers: PartnerLedger[];
  committedTotal: number | null;
} {
  const summarySheet = findSheet(workbook, /^vidal$/i) ?? workbook.SheetNames[0];
  const summaryRows = sheetRows(workbook, summarySheet);

  let committedTotal: number | null = null;
  const balances = new Map<string, number>();

  for (let r = 0; r < summaryRows.length; r++) {
    const label = cellText(summaryRows[r], 0);
    if (/aporte\s+inicial\s+total/i.test(label)) {
      const raw = cellText(summaryRows[r], 1) || cellText(summaryRows[r], 2);
      const parsed = Number(raw.replace(/[^\d.]/g, '').replace(/\.(?=\d{3}\b)/g, ''));
      if (Number.isFinite(parsed) && parsed > 0) committedTotal = parsed;
    }
    // Bloque "SOCIO | SALDO"
    if (/^socio$/i.test(label) && /saldo/i.test(cellText(summaryRows[r], 1))) {
      for (let k = r + 1; k < summaryRows.length; k++) {
        const name = cellText(summaryRows[k], 0);
        if (!name || /^total$/i.test(name)) break;
        balances.set(name.toUpperCase(), cellNumber(summaryRows[k], 1));
      }
    }
  }

  const ledgers: PartnerLedger[] = [];
  for (const sheetName of workbook.SheetNames) {
    if (sheetName === summarySheet) continue;
    const rows = sheetRows(workbook, sheetName);
    const header = headerIndex(rows, [/^Concepto$/i, /^SALDO USD$/i]);
    if (!header) continue;

    const iConcept = header.index['^Concepto$'];
    const iBalance = header.index['^SALDO USD$'];

    let committed: number | null = null;
    let lastBalance: number | null = null;
    for (const row of rows.slice(header.row + 1)) {
      const concept = cellText(row, iConcept);
      const balance = cellNumber(row, iBalance);
      if (/aporte\s+inicial/i.test(concept) && balance) committed = balance;
      if (balance) lastBalance = balance;
    }

    const name = sheetName.trim();
    ledgers.push({
      name,
      committed,
      balance: balances.get(name.toUpperCase()) ?? lastBalance,
    });
  }

  return { ledgers, committedTotal };
}

// ─── Armado del tablero ──────────────────────────────────────────────────────

function titleCase(value: string): string {
  return value
    .toLocaleLowerCase('es-AR')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toLocaleUpperCase('es-AR') + w.slice(1))
    .join(' ');
}

function buildFinance(
  fondos: XLSX.WorkBook,
  socios: XLSX.WorkBook | null,
  sources: VidalFinance['sources'],
): VidalFinance {
  const { movements, warnings } = parseMovements(fondos);
  const { ledgers, committedTotal } = socios
    ? parsePartnerLedgers(socios)
    : { ledgers: [] as PartnerLedger[], committedTotal: null };

  // ── Aportes por socio ──
  const aportes = movements.filter((m) => APORTES_RUBRO.test(m.rubro));
  const byPartner = new Map<
    string,
    { usd: number; usdDirect: number; arsConverted: number; arsNominal: number; movements: number }
  >();

  for (const m of aportes) {
    // "APORTE DARIO" → DARIO
    const token = m.detail.replace(/^aportes?\s*/i, '').trim().split(/\s+/)[0] ?? '';
    if (!token) continue;
    const key = token.toUpperCase();
    const entry =
      byPartner.get(key) ?? { usd: 0, usdDirect: 0, arsConverted: 0, arsNominal: 0, movements: 0 };
    entry.usd += m.usd;
    if (m.usdOwn) entry.usdDirect += m.usdOwn;
    else entry.arsConverted += m.usd;
    entry.arsNominal += m.ars;
    entry.movements += 1;
    byPartner.set(key, entry);
  }

  const contributionsTotal = [...byPartner.values()].reduce((acc, e) => acc + e.usd, 0);

  const partners: PartnerContribution[] = [...byPartner.entries()]
    .map(([key, entry]) => {
      const ledger = ledgers.find((l) => l.name.toUpperCase().startsWith(key));
      const fullName = ledger?.name ?? titleCase(key);
      return {
        name: fullName,
        firstName: fullName.split(/\s+/)[0] ?? fullName,
        usd: round(entry.usd),
        usdDirect: round(entry.usdDirect),
        arsConverted: round(entry.arsConverted),
        arsNominal: round(entry.arsNominal),
        movements: entry.movements,
        share: contributionsTotal > 0 ? entry.usd / contributionsTotal : 0,
        committed: ledger?.committed ?? null,
        ledgerBalance: ledger?.balance ?? null,
      };
    })
    .sort((a, b) => b.usd - a.usd);

  // Control cruzado: lo que dice MOVIMIENTOS vs. la cuenta corriente del socio.
  for (const partner of partners) {
    if (partner.committed == null || partner.ledgerBalance == null) continue;
    const expected = partner.committed - partner.ledgerBalance;
    const gap = partner.usd - expected;
    if (Math.abs(gap) >= 1) {
      warnings.push(
        `${partner.firstName}: MOVIMIENTOS suma ${formatUsdShort(partner.usd)} aportados, ` +
          `pero su cuenta corriente en CUENTA SOCIOS implica ${formatUsdShort(expected)} ` +
          `(diferencia de ${formatUsdShort(Math.abs(gap))}).`,
      );
    }
  }

  // ── Egresos e ingresos por rubro ──
  const byRubro = new Map<string, { usd: number; movements: number }>();
  for (const m of movements) {
    if (APORTES_RUBRO.test(m.rubro)) continue;
    const key = m.rubro.toUpperCase();
    const entry = byRubro.get(key) ?? { usd: 0, movements: 0 };
    entry.usd += m.usd;
    entry.movements += 1;
    byRubro.set(key, entry);
  }

  const expenseLines: LedgerLine[] = [];
  const incomeLines: LedgerLine[] = [];
  for (const [category, entry] of byRubro) {
    const line = { category: titleCase(category), usd: round(Math.abs(entry.usd)), movements: entry.movements };
    if (!line.usd) continue;
    // Los egresos vienen en negativo; cuando empiecen las ventas, los ingresos
    // van a entrar como rubros positivos y caen acá solos.
    if (entry.usd < 0) expenseLines.push(line);
    else incomeLines.push(line);
  }
  expenseLines.sort((a, b) => b.usd - a.usd);
  incomeLines.sort((a, b) => b.usd - a.usd);

  const landLines = expenseLines.filter((l) => LAND_RUBRO.test(l.category));
  const otherLines = expenseLines.filter((l) => !LAND_RUBRO.test(l.category));
  const land = landLines.reduce((acc, l) => acc + l.usd, 0);
  const other = otherLines.reduce((acc, l) => acc + l.usd, 0);
  const incomeTotal = incomeLines.reduce((acc, l) => acc + l.usd, 0);

  const dates = movements.map((m) => m.date).filter((d): d is string => !!d);
  dates.sort();

  const contributionsUsdDirect = partners.reduce((acc, p) => acc + p.usdDirect, 0);
  const contributionsArsConverted = partners.reduce((acc, p) => acc + p.arsConverted, 0);
  const contributionsArsNominal = partners.reduce((acc, p) => acc + p.arsNominal, 0);

  const committed =
    committedTotal ??
    (partners.every((p) => p.committed != null)
      ? partners.reduce((acc, p) => acc + (p.committed ?? 0), 0)
      : null);

  return {
    currency: 'USD',
    periodLabel: parsePeriodLabel(fondos),
    lastMovementDate: dates.at(-1) ?? null,
    partners,
    contributions: {
      total: round(contributionsTotal),
      usdDirect: round(contributionsUsdDirect),
      arsConverted: round(contributionsArsConverted),
      arsNominal: round(contributionsArsNominal),
      movements: aportes.length,
    },
    expenses: {
      total: round(land + other),
      land: round(land),
      other: round(other),
      lines: expenseLines,
      landLines,
      otherLines,
    },
    income: { total: round(incomeTotal), lines: incomeLines },
    capital: {
      committed,
      contributed: round(contributionsTotal),
      pending: committed != null ? round(committed - contributionsTotal) : null,
      progress: committed && committed > 0 ? contributionsTotal / committed : null,
    },
    cash: round(contributionsTotal + incomeTotal - (land + other)),
    sources,
    warnings,
    syncedAt: new Date().toISOString(),
  };
}

function formatUsdShort(value: number): string {
  return `U$D ${Math.round(value).toLocaleString('es-AR')}`;
}

// ─── Carga desde Drive + cache ───────────────────────────────────────────────

async function readWorkbook(file: DriveFile): Promise<XLSX.WorkBook | null> {
  const drive = getDriveClient();
  if (!drive) return null;

  const isGoogleSheet = file.mimeType === 'application/vnd.google-apps.spreadsheet';
  const xlsxMime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  const res = isGoogleSheet
    ? await drive.files.export({ fileId: file.id, mimeType: xlsxMime }, { responseType: 'arraybuffer' })
    : await drive.files.get({ fileId: file.id, alt: 'media' }, { responseType: 'arraybuffer' });

  return XLSX.read(Buffer.from(res.data as ArrayBuffer), { type: 'buffer' });
}

const CACHE_TTL_MS = 10 * 60 * 1000;
let cache: { value: VidalFinance; at: number } | null = null;

export type VidalFinanceResult =
  | { ok: true; data: VidalFinance; cached: boolean }
  | { ok: false; reason: 'not-configured' | 'missing-files' | 'error'; message: string };

export async function getVidalFinance(options?: { force?: boolean }): Promise<VidalFinanceResult> {
  if (!options?.force && cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return { ok: true, data: cache.value, cached: true };
  }

  if (!getDriveClient()) {
    return {
      ok: false,
      reason: 'not-configured',
      message: 'Google Drive no está conectado.',
    };
  }

  try {
    const finanzasId = await resolveFinanzasFolder();
    if (!finanzasId) {
      return {
        ok: false,
        reason: 'missing-files',
        message: 'No se encontró la carpeta Finanzas en Drive.',
      };
    }

    const { files } = await listDriveFiles({ folderId: finanzasId, pageSize: 200 });
    const fondosFile = files.find((f) => !f.isFolder && FONDOS_PATTERN.test(f.name));
    const sociosFile = files.find((f) => !f.isFolder && SOCIOS_PATTERN.test(f.name));

    if (!fondosFile) {
      return {
        ok: false,
        reason: 'missing-files',
        message: 'No se encontró "ADMINISTRACION FONDOS VIDAL" en Finanzas.',
      };
    }

    const [fondos, socios] = await Promise.all([
      readWorkbook(fondosFile),
      sociosFile ? readWorkbook(sociosFile) : Promise.resolve(null),
    ]);
    if (!fondos) {
      return { ok: false, reason: 'error', message: 'No se pudo leer la planilla de fondos.' };
    }

    const sources = [fondosFile, sociosFile]
      .filter((f): f is DriveFile => !!f)
      .map((f) => ({
        name: f.name,
        fileId: f.id,
        webViewLink: f.webViewLink,
        modifiedTime: f.modifiedTime,
      }));

    const data = buildFinance(fondos, socios, sources);
    if (!sociosFile) {
      data.warnings.push('No se encontró "CUENTA SOCIOS": faltan los saldos por socio.');
    }

    cache = { value: data, at: Date.now() };
    return { ok: true, data, cached: false };
  } catch (err) {
    return {
      ok: false,
      reason: 'error',
      message: err instanceof Error ? err.message : 'No se pudieron leer las planillas.',
    };
  }
}
