import { detectReferences, generateReference } from '../../dist/scriptures.mjs';
import { loadFixtures, getTestCases } from '../helpers/fixture-loader.js';

const fixtures = loadFixtures();
const edgeCases = getTestCases(fixtures, 'detect', 'edge_cases');

// Features not yet implemented - skip these tests
const UNIMPLEMENTED_FEATURES = [
  'context-dependent',  // vv. notation requiring prior chapter context
  'chapter-only',       // Full book name with chapter only (no verses)
  'book-only',          // Full book name without chapter or verses (e.g., "Second John")
  'spelled-delimiter',  // "chapter X, verse Y" or "verses X through Y" spelled format
  'verses-prefix',      // "Verses 22-23" referencing previously mentioned chapter
  'vv-prefix',          // "vv. 5-10" verse range notation
  'ch-vv',              // "Ch. 5 ... vv. 16-26" chapter and verse abbreviations
  'comma-delimiter',    // European style "19,16-22" comma as chapter:verse separator
  'chapter-list',       // "Matthew 5, 6, and 7" list of chapters
  'song-of-songs',      // "Song of Songs" alternate name for Song of Solomon
  'canticles',          // "Canticles" alternate name for Song of Solomon
  'gospel-of',          // "Gospel of Matthew" without chapter (book-only context)
];

describe('detectReferences - Edge Cases', () => {
  if (edgeCases.length === 0) {
    test.skip('No edge cases currently defined', () => {});
  } else {
    describe.each(edgeCases)('$id: $description [$tags]', (tc) => {
      const hasUnimplementedFeature = tc.tags?.some(tag =>
        UNIMPLEMENTED_FEATURES.includes(tag)
      );

      if (hasUnimplementedFeature) {
        test.skip(`detects expected references (requires: ${tc.tags.filter(t => UNIMPLEMENTED_FEATURES.includes(t)).join(', ')})`, () => {});
      } else {
        test('detects expected references', () => {
          const foundRefs = [];

          detectReferences(
            tc.input,
            (text, ids) => {
              foundRefs.push(generateReference(ids, tc.language));
              return `[${text}]`;
            },
            { language: tc.language, contextAware: true }
          );

          expect(foundRefs).toEqual(tc.expected_refs);
        });
      }
    });
  }
});
