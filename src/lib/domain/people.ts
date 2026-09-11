/**
 * Nombres para mostrar de los socios. Las cuentas se crearon con el usuario
 * corto ("dmintzer"), así que traducimos esos casos al nombre real y dejamos
 * una derivación razonable para cualquier cuenta nueva.
 */

const KNOWN_FULL_NAMES: Record<string, string> = {
  dmintzer: 'Dario Mintzer',
  fsujarchuk: 'Federico Sujarchuk',
  pascual: 'Pascual Galliverti',
};

function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toLocaleUpperCase('es-AR') + value.slice(1).toLocaleLowerCase('es-AR');
}

function lookup(value: string | null | undefined): string | null {
  if (!value) return null;
  return KNOWN_FULL_NAMES[value.trim().toLowerCase()] ?? null;
}

export function displayName(
  user?: { name?: string | null; email?: string | null } | null,
): string | null {
  const name = user?.name?.trim();
  const local = user?.email?.split('@')[0]?.trim();

  const known = lookup(name) ?? lookup(local);
  if (known) return known;

  // Nombre completo ya cargado en la base.
  if (name && /\s/.test(name)) {
    return name.split(/\s+/).map(capitalize).join(' ');
  }

  if (name && !/[._@-]/.test(name)) return capitalize(name);

  if (local) {
    const parts = local.split(/[._-]/).filter((p) => p.length > 1);
    if (parts.length) return parts.map(capitalize).join(' ');
  }

  return name ? capitalize(name) : null;
}

export function firstName(
  user?: { name?: string | null; email?: string | null } | null,
): string | null {
  const full = displayName(user);
  return full ? (full.split(/\s+/)[0] ?? full) : null;
}

export function initialsOf(
  user?: { name?: string | null; email?: string | null } | null,
): string {
  const full = displayName(user);
  if (!full) return '?';
  return full
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function greetingFor(date: Date): string {
  const hour = date.getHours();
  if (hour < 12) return 'Buen día';
  if (hour < 20) return 'Buenas tardes';
  return 'Buenas noches';
}
