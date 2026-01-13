import { loadCanonLanguage, loadFullLanguage, clearCanonCache } from '../../src/lib/canon-loader.mjs';

describe('Canon Language Loading', () => {
  beforeEach(() => {
    clearCanonCache();
  });

  test('loads Bible English book names', () => {
    const bibleEn = loadCanonLanguage('bible', 'en');

    expect(bibleEn).not.toBeNull();
    expect(bibleEn.canon).toBe('bible');
    expect(bibleEn.language).toBe('en');
    expect(bibleEn.books).toBeDefined();
    expect(bibleEn.books.genesis).toBeDefined();
    expect(bibleEn.books.genesis.name).toBe('Genesis');
    expect(bibleEn.books.genesis.abbreviations).toContain('gen');
  });

  test('loadFullLanguage merges shared + canon', () => {
    const full = loadFullLanguage('bible', 'en');

    // From shared
    expect(full.delimiters).toBeDefined();
    expect(full.numerals.roman.I).toBe(1);

    // From canon
    expect(full.books.genesis.name).toBe('Genesis');
  });
});
