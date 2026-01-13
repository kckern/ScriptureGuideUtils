import { loadSharedLanguage } from '../../src/lib/canon-loader.mjs';

describe('Shared Language Loading', () => {
  test('loads English shared patterns', () => {
    const shared = loadSharedLanguage('en');

    expect(shared).not.toBeNull();
    expect(shared.language).toBe('en');
    expect(shared.delimiters).toBeDefined();
    expect(shared.delimiters.chapter_verse).toContain(':');
    expect(shared.numerals).toBeDefined();
    expect(shared.numerals.roman.I).toBe(1);
    expect(shared.pre_rules).toBeDefined();
    expect(Array.isArray(shared.pre_rules)).toBe(true);
  });

  test('returns null for unknown language', () => {
    const shared = loadSharedLanguage('xyz');
    expect(shared).toBeNull();
  });
});
