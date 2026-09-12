import { formatUsd } from '@/lib/format';
import type { PriceList } from '@/lib/finance/prices';
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type RGB } from 'pdf-lib';

export type PricePdfMeta = {
  projectName: string;
  address: string;
  city: string;
};

const PAGE = { width: 595.28, height: 841.89 };
const MARGIN = 44;

const INK = rgb(33 / 255, 32 / 255, 30 / 255);
const NIEBLA = rgb(110 / 255, 111 / 255, 104 / 255);
const TIERRA = rgb(95 / 255, 70 / 255, 50 / 255);
const ARENA = rgb(179 / 255, 148 / 255, 95 / 255);
const SUELO = rgb(226 / 255, 220 / 255, 209 / 255);
const LINO = rgb(240 / 255, 237 / 255, 230 / 255);
const BLANCO = rgb(248 / 255, 247 / 255, 244 / 255);

/** Standard fonts only speak WinAnsi — strip the rest. */
export function pdfText(value: string): string {
  return value
    .replace(/\u00a0|\u202f|\u2009/g, ' ')
    .replace(/[–—]/g, '-')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/²/g, '2')
    .normalize('NFKD')
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, '');
}

function formatM2(value: number): string {
  return `${value.toLocaleString('es-AR', { maximumFractionDigits: 1 })} m2`;
}

function drawText(
  page: PDFPage,
  text: string,
  opts: { x: number; y: number; font: PDFFont; size: number; color: RGB },
) {
  page.drawText(pdfText(text), opts);
}

export function priceListFileName(projectName: string): string {
  const slug = projectName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${slug || 'lista'}-lista-precios.pdf`;
}

export async function buildPriceListPdf(list: PriceList, meta: PricePdfMeta): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`${meta.projectName} - Lista de precios`);
  doc.setAuthor('Raices');
  doc.setSubject(list.listName);

  const page = doc.addPage([PAGE.width, PAGE.height]);
  const serif = await doc.embedFont(StandardFonts.TimesRoman);
  const sans = await doc.embedFont(StandardFonts.Helvetica);
  const sansBold = await doc.embedFont(StandardFonts.HelveticaBold);

  page.drawRectangle({ x: 0, y: 0, width: PAGE.width, height: PAGE.height, color: LINO });

  let y = PAGE.height - MARGIN;

  drawText(page, 'RAICES', { x: MARGIN, y, font: sans, size: 8, color: NIEBLA });
  const date = new Date().toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const dateW = sans.widthOfTextAtSize(pdfText(date), 8);
  drawText(page, date, {
    x: PAGE.width - MARGIN - dateW,
    y,
    font: sans,
    size: 8,
    color: NIEBLA,
  });

  y -= 28;
  drawText(page, 'Lista de precios', { x: MARGIN, y, font: serif, size: 28, color: INK });
  y -= 18;
  const place = [meta.projectName, meta.address, meta.city].filter(Boolean).join('  ·  ');
  drawText(page, place, { x: MARGIN, y, font: sans, size: 10, color: NIEBLA });
  y -= 8;
  page.drawRectangle({ x: MARGIN, y, width: 28, height: 1.2, color: ARENA });
  y -= 18;
  drawText(page, `${list.listName}  ·  ${list.units.length} unidades  ·  Valores en USD`, {
    x: MARGIN,
    y,
    font: sans,
    size: 9,
    color: NIEBLA,
  });

  y -= 28;
  const gap = 10;
  const cardW = (PAGE.width - MARGIN * 2 - gap * 2) / 3;
  const cardH = 92;
  const cardTop = y;

  for (const [i, t] of list.typologies.entries()) {
    const x = MARGIN + i * (cardW + gap);
    const prices = list.units.filter((u) => u.code === t.code).map((u) => u.price);
    const from = prices.length ? Math.min(...prices) : 0;

    page.drawRectangle({
      x,
      y: cardTop - cardH,
      width: cardW,
      height: cardH,
      color: BLANCO,
      borderColor: SUELO,
      borderWidth: 0.8,
    });

    drawText(page, t.code, {
      x: x + cardW - 22,
      y: cardTop - 26,
      font: serif,
      size: 22,
      color: TIERRA,
    });
    drawText(page, t.location, {
      x: x + 12,
      y: cardTop - 18,
      font: sans,
      size: 7,
      color: NIEBLA,
    });
    drawText(page, t.rooms || `Unidad ${t.code}`, {
      x: x + 12,
      y: cardTop - 34,
      font: serif,
      size: 13,
      color: INK,
    });
    drawText(page, `${formatM2(t.coveredM2)} cubiertos`, {
      x: x + 12,
      y: cardTop - 52,
      font: sans,
      size: 7,
      color: NIEBLA,
    });
    drawText(page, `${formatM2(t.totalM2)} sin SUM`, {
      x: x + 12,
      y: cardTop - 64,
      font: sans,
      size: 7,
      color: NIEBLA,
    });
    const withSum = `${formatM2(t.totalWithSumM2)} con SUM`;
    const withSumW = sans.widthOfTextAtSize(pdfText(withSum), 7);
    drawText(page, withSum, {
      x: x + cardW - 12 - withSumW,
      y: cardTop - 64,
      font: sans,
      size: 7,
      color: NIEBLA,
    });
    drawText(page, `Desde ${formatUsd(from)}`, {
      x: x + 12,
      y: cardTop - 80,
      font: sans,
      size: 9,
      color: INK,
    });
  }

  y = cardTop - cardH - 28;
  const floors = list.floors;
  const colGap = 28;
  const colW = (PAGE.width - MARGIN * 2 - colGap) / 2;
  const rowH = 22;
  const blockH = 16 + list.units.filter((u) => u.floor === floors[0]).length * rowH;

  floors.forEach((floor, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = MARGIN + col * (colW + colGap);
    const top = y - row * (blockH + 22);

    drawText(page, `Piso ${floor}`, {
      x,
      y: top,
      font: sans,
      size: 8,
      color: NIEBLA,
    });

    const units = list.units.filter((u) => u.floor === floor);
    units.forEach((unit, i) => {
      const lineY = top - 18 - i * rowH;
      page.drawLine({
        start: { x, y: lineY + 14 },
        end: { x: x + colW, y: lineY + 14 },
        thickness: 0.5,
        color: i === 0 ? ARENA : SUELO,
      });
      drawText(page, unit.code, { x, y: lineY, font: serif, size: 13, color: TIERRA });
      drawText(page, unit.location, { x: x + 22, y: lineY + 1, font: sans, size: 9, color: INK });
      if (unit.rooms) {
        drawText(page, unit.rooms, { x: x + 22, y: lineY - 10, font: sans, size: 7.5, color: NIEBLA });
      }
      const price = formatUsd(unit.price);
      const pw = sansBold.widthOfTextAtSize(pdfText(price), 10);
      drawText(page, price, {
        x: x + colW - pw,
        y: lineY,
        font: sansBold,
        size: 10,
        color: INK,
      });
    });
  });

  drawText(page, 'Superficies de planta tipo. Lista sujeta a disponibilidad.', {
    x: MARGIN,
    y: MARGIN - 4,
    font: sans,
    size: 8,
    color: NIEBLA,
  });

  return doc.save();
}
