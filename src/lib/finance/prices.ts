import { getDriveClient, listDriveFiles, resolveFinanzasFolder, type DriveFile } from '@/lib/google/drive';
import * as XLSX from 'xlsx';

/**
 * Lista de preventa 1 de Ceibo Vidal, leída de Finanzas /
 * VIDAL3849_NEGOCIO_REBUILT_V2, hoja 05_Precios_Unidades.
 *
 * Superficies: filas 17–19 (A/B/C).
 *   C cubiertos · F total sin SUM · H total con SUM
 * Precios: columna F (Preventa 1), filas 28–39.
 */

const FILE_PATTERN = /VIDAL3849_NEGOCIO_REBUILT_V2/i;
const SHEET_PATTERN = /05_Precios_Unidades/i;

export type UnitTypology = {
  code: 'A' | 'B' | 'C';
  label: string;
  location: string;
  rooms: string;
  coveredM2: number;
  totalM2: number;
  sumM2: number;
  totalWithSumM2: number;
};

export type PricedUnit = {
  id: string;
  code: 'A' | 'B' | 'C';
  floor: number;
  floorLabel: string;
  location: string;
  rooms: string;
  coveredM2: number;
  totalM2: number;
  totalWithSumM2: number;
  price: number;
};

export type PriceList = {
  currency: 'USD';
  listName: string;
  units: PricedUnit[];
  typologies: UnitTypology[];
  floors: number[];
  minPrice: number;
  maxPrice: number;
  source: { name: string; fileId: string; webViewLink: string | null; modifiedTime: string | null } | null;
  syncedAt: string;
};

export type PriceListResult =
  | { ok: true; data: PriceList; cached: boolean }
  | { ok: false; reason: 'not-configured' | 'missing-files' | 'error'; message: string };

type Row = unknown[];

function cellText(row: Row | undefined, col: number): string {
  if (!row || col < 0) return '';
  const value = row[col];
  return value == null ? '' : String(value).trim();
}

function cellNumber(row: Row | undefined, col: number): number {
  if (!row || col < 0) return 0;
  const value = row[col];
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const text = String(value ?? '').replace(/\s/g, '').replace(',', '.');
  const parsed = Number(text.replace(/[^\d.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function round(value: number, digits = 2): number {
  const f = 10 ** digits;
  return Math.round(value * f) / f;
}

function locationLabel(raw: string): string {
  if (/^cf$/i.test(raw) || /contrafrente/i.test(raw)) return 'Contrafrente';
  if (/frente/i.test(raw)) return 'Frente';
  return raw;
}

function roomsFrom(label: string): string {
  const match = label.match(/(\d)\s*amb/i);
  if (match) return match[1] === '1' ? 'Monoambiente' : `${match[1]} ambientes`;
  if (/mono/i.test(label)) return 'Monoambiente';
  return '';
}

function typologyCode(text: string): 'A' | 'B' | 'C' | null {
  const match = text.match(/depto\s*([abc])/i) ?? text.match(/\b([abc])\b/i);
  if (!match) return null;
  return match[1].toUpperCase() as 'A' | 'B' | 'C';
}

function floorNumber(text: string): number | null {
  const match = text.match(/p\s*([1-4])/i);
  return match ? Number(match[1]) : null;
}

function typologyFromRow(row: Row | undefined): UnitTypology | null {
  if (!row) return null;
  const label = cellText(row, 1);
  const code = typologyCode(label);
  const totalM2 = round(cellNumber(row, 5));
  if (!code || totalM2 < 20 || totalM2 > 200) return null;
  return {
    code,
    label,
    location: locationLabel(label.includes('CF') ? 'CF' : /frente/i.test(label) ? 'Frente' : ''),
    rooms: roomsFrom(label),
    coveredM2: round(cellNumber(row, 2)),
    totalM2,
    sumM2: round(cellNumber(row, 6)),
    totalWithSumM2: round(cellNumber(row, 7)),
  };
}

function readTypologies(rows: Row[]): UnitTypology[] {
  const fromFixed = [17, 18, 19]
    .map((excelRow) => typologyFromRow(rows[excelRow - 1]))
    .filter((t): t is UnitTypology => t !== null);
  if (fromFixed.length === 3) return fromFixed;

  const found: UnitTypology[] = [];
  const seen = new Set<UnitTypology['code']>();
  for (const row of rows) {
    const typology = typologyFromRow(row);
    if (!typology || seen.has(typology.code)) continue;
    seen.add(typology.code);
    found.push(typology);
    if (found.length === 3) break;
  }
  return found;
}

function unitFromRow(
  row: Row | undefined,
  byCode: Map<UnitTypology['code'], UnitTypology>,
): PricedUnit | null {
  if (!row) return null;
  const name = cellText(row, 1);
  const code = typologyCode(name);
  const floor = floorNumber(cellText(row, 2) || name);
  const typology = code ? byCode.get(code) : undefined;
  const price = round(cellNumber(row, 5), 2);
  if (!code || floor == null || !typology || price <= 0) return null;
  return {
    id: `${code}-${floor}`,
    code,
    floor,
    floorLabel: `Piso ${floor}`,
    location: locationLabel(cellText(row, 3) || typology.location),
    rooms: typology.rooms,
    coveredM2: typology.coveredM2,
    totalM2: typology.totalM2,
    totalWithSumM2: typology.totalWithSumM2,
    price,
  };
}

function readUnits(rows: Row[], byCode: Map<UnitTypology['code'], UnitTypology>): PricedUnit[] {
  const fromFixed: PricedUnit[] = [];
  for (let excelRow = 28; excelRow <= 39; excelRow++) {
    const unit = unitFromRow(rows[excelRow - 1], byCode);
    if (unit) fromFixed.push(unit);
  }
  if (fromFixed.length === 12) return fromFixed;

  const units: PricedUnit[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    const unit = unitFromRow(row, byCode);
    if (!unit || seen.has(unit.id)) continue;
    seen.add(unit.id);
    units.push(unit);
  }
  return units;
}

export function buildPriceList(
  workbook: XLSX.WorkBook,
  source: PriceList['source'] = null,
): PriceList {
  const sheetName = workbook.SheetNames.find((name) => SHEET_PATTERN.test(name));
  if (!sheetName) {
    throw new Error('No está la hoja 05_Precios_Unidades.');
  }

  const rows = XLSX.utils.sheet_to_json<Row>(workbook.Sheets[sheetName], {
    header: 1,
    defval: '',
    raw: true,
    blankrows: true,
  });

  const typologies = readTypologies(rows);
  const byCode = new Map(typologies.map((t) => [t.code, t]));
  const units = readUnits(rows, byCode);

  if (!units.length) {
    throw new Error('No se leyeron unidades en la tabla de preventa.');
  }

  const prices = units.map((u) => u.price);
  return {
    currency: 'USD',
    listName: 'Preventa 1',
    units,
    typologies,
    floors: [...new Set(units.map((u) => u.floor))].sort((a, b) => a - b),
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    source,
    syncedAt: new Date().toISOString(),
  };
}

async function readWorkbook(file: DriveFile): Promise<XLSX.WorkBook | null> {
  const drive = getDriveClient();
  if (!drive) return null;
  const xlsxMime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  const isGoogleSheet = file.mimeType === 'application/vnd.google-apps.spreadsheet';
  const res = isGoogleSheet
    ? await drive.files.export({ fileId: file.id, mimeType: xlsxMime }, { responseType: 'arraybuffer' })
    : await drive.files.get({ fileId: file.id, alt: 'media' }, { responseType: 'arraybuffer' });
  return XLSX.read(Buffer.from(res.data as ArrayBuffer), { type: 'buffer' });
}

const CACHE_TTL_MS = 10 * 60 * 1000;
let cache: { value: PriceList; at: number } | null = null;

export async function getVidalPrices(options?: { force?: boolean }): Promise<PriceListResult> {
  if (!options?.force && cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return { ok: true, data: cache.value, cached: true };
  }

  if (!getDriveClient()) {
    return { ok: false, reason: 'not-configured', message: 'Google Drive no está conectado.' };
  }

  try {
    const finanzasId = await resolveFinanzasFolder();
    if (!finanzasId) {
      return { ok: false, reason: 'missing-files', message: 'No se encontró la carpeta Finanzas.' };
    }

    const { files } = await listDriveFiles({ folderId: finanzasId, pageSize: 200 });
    let file = files.find((f) => !f.isFolder && FILE_PATTERN.test(f.name));
    if (!file) {
      const searched = await listDriveFiles({ query: 'VIDAL3849_NEGOCIO_REBUILT_V2', pageSize: 20 });
      file = searched.files.find((f) => !f.isFolder && FILE_PATTERN.test(f.name));
    }
    if (!file) {
      return {
        ok: false,
        reason: 'missing-files',
        message: 'No se encontró VIDAL3849_NEGOCIO_REBUILT_V2 en Finanzas.',
      };
    }

    const workbook = await readWorkbook(file);
    if (!workbook) {
      return { ok: false, reason: 'error', message: 'No se pudo leer el modelo de negocio.' };
    }

    const data = buildPriceList(workbook, {
      name: file.name,
      fileId: file.id,
      webViewLink: file.webViewLink,
      modifiedTime: file.modifiedTime,
    });
    cache = { value: data, at: Date.now() };
    return { ok: true, data, cached: false };
  } catch (err) {
    return {
      ok: false,
      reason: 'error',
      message: err instanceof Error ? err.message : 'No se pudieron leer los precios.',
    };
  }
}
