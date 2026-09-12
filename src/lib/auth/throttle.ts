/**
 * Freno de intentos de login en memoria.
 *
 * Es por instancia, no compartido entre lambdas, así que no es una defensa
 * perfecta; pero corta el caso real (alguien probando miles de contraseñas
 * contra la misma cuenta) sin agregar infraestructura.
 */

const MAX_ATTEMPTS = 8;
const WINDOW_MS = 10 * 60 * 1000;
const LOCKOUT_MS = 15 * 60 * 1000;

type Entry = { failures: number; firstAt: number; lockedUntil: number };

const attempts = new Map<string, Entry>();

/** Evita que el Map crezca sin límite si alguien rota direcciones. */
function prune(now: number) {
  if (attempts.size < 500) return;
  for (const [key, entry] of attempts) {
    if (entry.lockedUntil < now && now - entry.firstAt > WINDOW_MS) attempts.delete(key);
  }
}

export function isLockedOut(key: string): boolean {
  const entry = attempts.get(key.toLowerCase());
  if (!entry) return false;
  return entry.lockedUntil > Date.now();
}

export function recordFailure(key: string): void {
  const id = key.toLowerCase();
  const now = Date.now();
  prune(now);

  const entry = attempts.get(id);
  if (!entry || now - entry.firstAt > WINDOW_MS) {
    attempts.set(id, { failures: 1, firstAt: now, lockedUntil: 0 });
    return;
  }

  entry.failures += 1;
  if (entry.failures >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_MS;
    entry.failures = 0;
    entry.firstAt = now;
  }
}

export function recordSuccess(key: string): void {
  attempts.delete(key.toLowerCase());
}
