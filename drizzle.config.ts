import type { Config } from 'drizzle-kit';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// drizzle-kit doesn't load Next.js env files automatically
for (const file of ['.env.local', '.env']) {
  try {
    const lines = readFileSync(resolve(process.cwd(), file), 'utf-8').split('\n');
    for (const line of lines) {
      const m = line.match(/^([^#\s][^=]*)=(.*)$/);
      if (m) process.env[m[1].trim()] ??= m[2].trim();
    }
  } catch {}
}

export default {
  schema: './src/lib/db/schema.ts',
  out: './src/lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
