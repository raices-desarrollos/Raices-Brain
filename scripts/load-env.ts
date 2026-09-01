import { readFileSync } from 'fs';
import { resolve } from 'path';

function unquote(value: string): string {
  const v = value.trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    return v.slice(1, -1);
  }
  return v;
}

/** Load .env.local / .env like Next.js (strip wrapping quotes). */
export function loadDotenv(): void {
  for (const file of ['.env.local', '.env']) {
    try {
      for (const line of readFileSync(resolve(process.cwd(), file), 'utf-8').split('\n')) {
        const m = line.match(/^([^#\s][^=]*)=(.*)$/);
        if (m) process.env[m[1].trim()] ??= unquote(m[2]);
      }
    } catch {
      // missing file
    }
  }
}
