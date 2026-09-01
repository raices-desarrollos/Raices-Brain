function ensurePdfDomPolyfills() {
  const g = globalThis as Record<string, unknown>;
  if (!g.DOMMatrix) g.DOMMatrix = class DOMMatrix {};
  if (!g.ImageData) g.ImageData = class ImageData {};
  if (!g.Path2D) g.Path2D = class Path2D {};
}

export async function pdfToText(buffer: Buffer): Promise<string> {
  ensurePdfDomPolyfills();
  const { PDFParse } = await import('pdf-parse');
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text?.trim() ?? '';
  } finally {
    await parser.destroy().catch(() => undefined);
  }
}
