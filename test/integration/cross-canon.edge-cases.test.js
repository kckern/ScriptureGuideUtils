// Cross-canon concordance: edge cases (LDS <-> RLDS/COC)
// Contract: docs/reference/cross-canon-concordance.md
// Invariants under test: no silent loss (partial flag), loud failure on
// unmapped ranges, explicit canon wins for plain-integer ids.

import { lookupReference, generateReference, convertCanon } from '../../dist/scriptures.mjs';

describe('convertCanon - unmapped and invalid input', () => {
  test('id outside concordance coverage returns empty with partial flag', () => {
    // lds 40795 = D&C 121:7 — RLDS mapping covers JST + BOM only
    const result = convertCanon([40795], { from: 'lds', to: 'rlds' });
    expect(result.verse_ids).toEqual([]);
    expect(result.partial).toBe(true); // input was dropped: information lost
  });

  test('mixed mapped/unmapped ids convert what they can and flag partial', () => {
    const result = convertCanon([31104, 40795], { from: 'lds', to: 'rlds' });
    expect(result.verse_ids).toEqual([31336]);
    expect(result.partial).toBe(true);
  });

  test('empty input returns empty, not an error', () => {
    const result = convertCanon([], { from: 'lds', to: 'rlds' });
    expect(result.verse_ids).toEqual([]);
    expect(result.partial).toBe(false);
    expect(result.error).toBeUndefined();
  });

  test('unknown target canon errors loudly', () => {
    const result = convertCanon([31104], { from: 'lds', to: 'nope' });
    expect(result.verse_ids).toEqual([]);
    expect(result.error).toMatch(/no_mapping/);
  });

  test('same-canon conversion is identity', () => {
    const result = convertCanon([31104], { from: 'rlds', to: 'rlds' });
    expect(result.verse_ids).toEqual([31104]);
    expect(result.partial).toBe(false);
  });

  test('bare integers with no from default to the lds canon', () => {
    const result = convertCanon([31153], { to: 'rlds' });
    expect(result.verse_ids).toEqual([31400, 31401]);
  });
});

describe('lookupReference canon:rlds - boundaries', () => {
  test('book missing from rlds canon fails loudly, no silent lds fallback', () => {
    // RLDS canon has no Doctrine & Covenants
    const result = lookupReference('D&C 121:7', { canon: 'rlds' });
    expect(result.verse_ids).toEqual([]);
  });

  test('chapter beyond RLDS chaptering returns empty', () => {
    // RLDS 1 Nephi has only 7 chapters (LDS has 22)
    const result = lookupReference('1 Nephi 8:1', { canon: 'rlds' });
    expect(result.verse_ids).toEqual([]);
  });

  test('last verse of the rlds id space resolves', () => {
    const last = lookupReference('Moroni 10:34', { canon: 'rlds' });
    expect(last.verse_ids.length).toBe(1);
    expect(last.verse_ids[0]).toBeLessThanOrEqual(39975);
  });

  test('rlds and lds lookups of the same string do not pollute each other', () => {
    const rlds = lookupReference('1 Nephi 1:67', { canon: 'rlds' });
    const lds = lookupReference('1 Nephi 3:7');
    const rldsAgain = lookupReference('1 Nephi 1:67', { canon: 'rlds' });
    expect(rlds.verse_ids).toEqual([31400]);
    expect(lds.verse_ids).toEqual([31153]);
    expect(rldsAgain.verse_ids).toEqual([31400]);
    expect(lds.ref).toBe('1 Nephi 3:7');
  });
});

describe('generateReference canon:rlds - boundaries', () => {
  test('explicit canon wins for plain-integer ids (no mismatch veto)', () => {
    // 31400 is a valid id in BOTH spaces; explicit canon must control rendering
    expect(generateReference([31400], { canon: 'rlds' })).toBe('1 Nephi 1:67');
    expect(generateReference([31400], { canon: 'lds' })).not.toBe('1 Nephi 1:67');
  });

  test('id beyond rlds id space renders nothing', () => {
    expect(generateReference([39976], { canon: 'rlds' })).toBe('');
  });

  test('cross-chapter rlds range renders with chapter boundaries', () => {
    // rlds 1 Nephi 1:174 (31507) + 2:1 (31508)
    const ref = generateReference([31507, 31508], { canon: 'rlds' });
    expect(ref).toBe('1 Nephi 1:174-2:1');
  });
});

describe('convertTo - degraded paths', () => {
  test('lookup that resolves but cannot convert reports empty ids with source canon', () => {
    const result = lookupReference('D&C 121:7', { convertTo: 'rlds' });
    expect(result.sourceCanon).toBe('lds');
    expect(result.verse_ids).toEqual([]);
    expect(result.partial).toBe(true);
  });

  test('convertTo same canon is a no-op', () => {
    const result = lookupReference('1 Nephi 3:7', { canon: 'lds', convertTo: 'lds' });
    expect(result.verse_ids).toEqual([31153]);
    expect(result.partial).toBeUndefined();
  });
});
