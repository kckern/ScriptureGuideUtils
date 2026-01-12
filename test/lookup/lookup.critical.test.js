import { lookupReference } from '../../dist/scriptures.mjs';
import { loadFixtures, getTestCases } from '../helpers/fixture-loader.js';

const fixtures = loadFixtures();
const criticalCases = getTestCases(fixtures, 'lookup', 'critical');
const invalidCases = getTestCases(fixtures, 'lookup', 'invalid');

describe('lookupReference - Critical', () => {
  describe.each(criticalCases)('$id: $description', (tc) => {
    test('returns correct verse IDs', () => {
      const result = lookupReference(tc.input, tc.language);
      expect(result.verse_ids).toEqual(tc.expected_ids);
    });

    test('generates canonical reference', () => {
      const result = lookupReference(tc.input, tc.language);
      expect(result.ref).toBe(tc.expected_ref);
    });
  });
});

describe('lookupReference - Invalid Inputs', () => {
  describe.each(invalidCases)('$id: $description', (tc) => {
    test('returns empty for invalid input', () => {
      const result = lookupReference(tc.input, tc.language);
      expect(result.verse_ids).toEqual([]);
    });
  });
});
