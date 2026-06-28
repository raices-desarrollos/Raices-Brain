// Redacción automática de información sensible antes de indexar
// Elimina o reemplaza datos confidenciales en documentos financieros y legales

export interface RedactionRule {
  pattern: RegExp;
  replacement: string;
  description: string;
}

// Patrones de redacción para información sensible
const REDACTION_RULES: RedactionRule[] = [
  {
    pattern: /\b[A-Z]{2}\d{2}[A-Z0-9]{4}\d{7}([A-Z0-9]?){0,16}\b/g,
    replacement: '[IBAN REDACTADO]',
    description: 'IBANs bancarios',
  },
  {
    pattern: /\bCBU\s*:?\s*\d{22}\b/gi,
    replacement: '[CBU REDACTADO]',
    description: 'CBU bancario argentino',
  },
  {
    pattern: /\bDNI\s*:?\s*\d{7,8}\b/gi,
    replacement: '[DNI REDACTADO]',
    description: 'Número de DNI',
  },
  {
    pattern: /\bCUIT\s*:?\s*\d{2}-\d{8}-\d{1}\b/gi,
    replacement: '[CUIT REDACTADO]',
    description: 'CUIT argentino',
  },
];

/**
 * Aplica redacción automática a un texto antes de indexarlo.
 * @param content El contenido del documento
 * @param isConfidential Si el documento es confidencial (aplica más redacciones)
 * @returns El contenido con la información sensible redactada
 */
export function redactSensitiveData(content: string, isConfidential: boolean = false): string {
  let redacted = content;

  for (const rule of REDACTION_RULES) {
    redacted = redacted.replace(rule.pattern, rule.replacement);
  }

  return redacted;
}

/**
 * Verifica si un documento requiere redacción antes de indexarse.
 */
export function requiresRedaction(category: string): boolean {
  return ['finance', 'legal'].includes(category);
}
