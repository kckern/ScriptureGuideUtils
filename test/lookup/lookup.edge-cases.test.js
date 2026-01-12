import { lookupReference } from '../../dist/scriptures.mjs';
import { loadFixtures, getTestCases } from '../helpers/fixture-loader.js';

const fixtures = loadFixtures();
const edgeCases = getTestCases(fixtures, 'lookup', 'edge_cases');

describe('lookupReference - Edge Cases', () => {
  describe.each(edgeCases)('$id: $description [$tags]', (tc) => {
    test('returns correct verse IDs despite formatting', () => {
      const result = lookupReference(tc.input, tc.language);
      expect(result.verse_ids).toEqual(tc.expected_ids);
    });

    test('normalizes to canonical reference', () => {
      const result = lookupReference(tc.input, tc.language);
      expect(result.ref).toBe(tc.expected_ref);
    });
  });
});
