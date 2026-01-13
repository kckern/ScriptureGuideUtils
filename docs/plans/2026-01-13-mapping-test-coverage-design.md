# Mapping Test Coverage Design

**Date:** 2026-01-13
**Status:** Ready for implementation

## Summary

Add comprehensive test coverage for the RLDS `_mapping.yml` cross-canon mappings, including a new mapping loader and tests for data integrity, loader functionality, and cross-canon lookups.

## File Structure

```
test/
├── mapping/
│   ├── mapping.critical.test.js      # Core functionality tests
│   ├── mapping.edge-cases.test.js    # Unusual inputs, boundaries
│   └── mapping.data-integrity.test.js # Validates _mapping.yml structure
├── fixtures/
│   └── en/
│       └── mapping/
│           ├── critical.yml          # Critical test cases
│           └── edge-cases.yml        # Edge case test data
src/
└── lib/
    └── mapping-loader.mjs            # New: loads & expands mappings
```

## Mapping Loader API

```javascript
// src/lib/mapping-loader.mjs

/**
 * Load and expand mapping data from a canon's _mapping.yml
 * @param {string} canonName - Source canon (e.g., 'rlds')
 * @returns {Object} Expanded mappings keyed by target canon
 */
export function loadMappings(canonName);

/**
 * Map a verse between canons
 * @param {number|string} input - Verse ID or reference string
 * @param {string} fromCanon - Source canon
 * @param {string} toCanon - Target canon
 * @returns {Object|null} { ids: [number], refs: [string], partial: boolean }
 */
export function mapVerse(input, fromCanon, toCanon);

/**
 * Map verse ID only (faster, no reference resolution)
 * @returns {Object|null} { ids: [number], partial: boolean }
 */
export function mapVerseId(id, fromCanon, toCanon);

/**
 * Clear mapping cache (for testing)
 */
export function clearMappingCache();
```

**Return object structure:**
- `ids`: Array of target verse IDs (usually 1, but can be multiple for splits)
- `refs`: Array of human-readable references (optional, only if input was reference)
- `partial`: `true` if this is a many-to-one mapping (verse was split/combined)

## Test Cases

### Critical Tests (`critical.yml`)

```yaml
# Loader functionality
loader:
  - canon: rlds
    targets: [bible, lds]

# Bible ↔ JST mappings
bible_jst:
  - name: "JST Genesis 1:1 (first JST verse)"
    rlds_id: 1
    bible_id: null
  - name: "JST Genesis verse with Bible equivalent"
    rlds_id: 3
    bible_id: 1
  - name: "JST multi-mapping (one JST → multiple Bible)"
    rlds_id: 17
    bible_ids: [12, 13]
    partial: true

# COC ↔ LDS Book of Mormon mappings
coc_lds:
  - name: "1 Nephi 1:1 (first BOM verse)"
    coc_id: 31334
    lds_id: 31103
  - name: "Last BOM verse (Moroni 10:30/34)"
    coc_id: 39975
    lds_id: 37706
  - name: "Cross-chapter boundary"
    coc_ref: "1 Nephi 5:218"
    lds_ref: "1 Nephi 19:1"

# Round-trip verification
roundtrip:
  - name: "COC → LDS → COC"
    start_id: 31500
    canon_path: [rlds, lds, rlds]
    expect_same: true
  - name: "JST → Bible → JST"
    start_id: 100
    canon_path: [rlds, bible, rlds]
    expect_same: true
```

### Edge Cases (`edge-cases.yml`)

```yaml
# Boundary conditions
boundaries:
  - name: "First verse of each BOM book"
    cases:
      - { book: "1_nephi", coc_id: 31334, lds_id: 31103 }
      - { book: "2_nephi", coc_id: 32311, lds_id: 31721 }
      # ... all 15 books

# Multi-mappings (splits/combines)
multi:
  - name: "One COC verse spans multiple LDS verses"
    coc_id: 31608
    lds_ids: [31308, 31310]
    partial: true

# Invalid inputs
invalid:
  - name: "ID outside canon range"
    input: 99999
    expect: null
  - name: "Unknown canon"
    expect: error
  - name: "No mapping exists (BOM to Bible)"
    expect: null

# Reference string parsing
references:
  - name: "Full reference with chapter:verse"
    input: "1 Nephi 1:50"
    expect_ref: "1 Nephi 2:20"
```

### Data Integrity Tests

```javascript
describe('Mapping Data Integrity', () => {
  describe('RLDS Bible Mapping', () => {
    test('all runs have valid format [start, target, length]');
    test('all singles have valid format [source, target]');
    test('all multi have valid format [source, [targets]]');
    test('no overlapping source IDs');
    test('all source IDs within JST range (1-31333)');
    test('all target IDs within Bible range (1-31102)');
  });

  describe('RLDS LDS Mapping', () => {
    test('all source IDs within COC BOM range (31334-39975)');
    test('all target IDs within LDS BOM range (31103-37706)');
    test('complete coverage: no gaps in source IDs');
    test('complete coverage: no gaps in target IDs');
  });

  describe('Bidirectional Consistency', () => {
    test('every source ID maps to at least one target');
    test('every target ID is reachable from at least one source');
  });
});
```

## Implementation Order

1. Create `src/lib/mapping-loader.mjs` with core expansion logic
2. Create `test/mapping/mapping.data-integrity.test.js` (validates data without loader)
3. Create test fixtures (`critical.yml`, `edge-cases.yml`)
4. Create `test/mapping/mapping.critical.test.js`
5. Create `test/mapping/mapping.edge-cases.test.js`
6. Run full test suite and fix any issues
