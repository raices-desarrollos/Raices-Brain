import { describe, expect, it } from 'vitest';
import { formatProjectName } from '@/lib/domain/catalog';
import { formatCount } from '@/lib/format';

describe('formatProjectName', () => {
  it('shows Ceibo Vidal instead of the slug', () => {
    expect(formatProjectName('ceibo-vidal')).toBe('Ceibo Vidal');
  });

  it('does not invent a project', () => {
    expect(formatProjectName(null)).toBe('—');
  });
});

describe('formatCount', () => {
  it('uses natural Spanish', () => {
    expect(formatCount(0, 'factura', 'facturas')).toBe('No hay facturas');
    expect(formatCount(1, 'factura', 'facturas')).toBe('1 factura');
    expect(formatCount(3, 'factura', 'facturas')).toBe('3 facturas');
  });
});
