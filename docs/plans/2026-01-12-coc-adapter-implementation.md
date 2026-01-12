# COC Versification Adapter Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add bidirectional conversion between LDS and Community of Christ Book of Mormon versification systems.

**Architecture:** New `scriptcanon.mjs` module handles conversion logic. Generated `coc-mapping.mjs` provides verse-level mappings built from text alignment. Existing API extended with `canon`, `convertTo`, and `includeParallel` options.

**Tech Stack:** JavaScript ES modules, Node.js fetch API, text similarity matching.

**Design Doc:** `docs/plans/2026-01-11-coc-adapter-design.md`

---

## Task 1: Create scriptcanon.mjs with ID utilities

**Files:**
- Create: `src/scriptcanon.mjs`
- Create: `test/test-scriptcanon.js`

**Step 1: Write failing tests for ID utilities**

```javascript
// test/test-scriptcanon.js
import { detectCanon, formatCocId, parseCocId } from '../src/scriptcanon.mjs';

const tests = [];
const test = (name, fn) => tests.push({ name, fn });
const run = () => {
  let passed = 0, failed = 0;
  for (const t of tests) {
    try {
      t.fn();
      console.log(`✓ ${t.name}`);
      passed++;
    } catch (e) {
      console.log(`✗ ${t.name}: ${e.message}`);
      failed++;
    }
  }
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
};

// detectCanon tests
test('detectCanon returns "coc" for C-prefixed string', () => {
  if (detectCanon('C00001') !== 'coc') throw new Error('Expected coc');
});

test('detectCanon returns "lds" for integer', () => {
  if (detectCanon(31103) !== 'lds') throw new Error('Expected lds');
});

test('detectCanon returns "lds" for numeric string', () => {
  if (detectCanon('31103') !== 'lds') throw new Error('Expected lds');
});

test('detectCanon returns null for invalid input', () => {
  if (detectCanon('invalid') !== null) throw new Error('Expected null');
});

// formatCocId tests
test('formatCocId pads to 5 digits', () => {
  if (formatCocId(1) !== 'C00001') throw new Error('Expected C00001');
  if (formatCocId(50) !== 'C00050') throw new Error('Expected C00050');
  if (formatCocId(6839) !== 'C06839') throw new Error('Expected C06839');
});

// parseCocId tests
test('parseCocId extracts number', () => {
  if (parseCocId('C00001') !== 1) throw new Error('Expected 1');
  if (parseCocId('C00050') !== 50) throw new Error('Expected 50');
  if (parseCocId('C06839') !== 6839) throw new Error('Expected 6839');
});

run();
```

**Step 2: Run test to verify it fails**

Run: `node test/test-scriptcanon.js`
Expected: FAIL with "Cannot find module '../src/scriptcanon.mjs'"

**Step 3: Write minimal implementation**

```javascript
// src/scriptcanon.mjs

/**
 * Detect canon from verse_id format
 * @param {string|number} verseId
 * @returns {'coc'|'lds'|null}
 */
export const detectCanon = (verseId) => {
  if (typeof verseId === 'string' && /^C\d+$/.test(verseId)) return 'coc';
  if (typeof verseId === 'number') return 'lds';
  if (typeof verseId === 'string' && /^\d+$/.test(verseId)) return 'lds';
  return null;
};

/**
 * Format COC verse_id: 50 → "C00050"
 * @param {number} num
 * @returns {string}
 */
export const formatCocId = (num) => `C${String(num).padStart(5, '0')}`;

/**
 * Parse COC verse_id: "C00050" → 50
 * @param {string} id
 * @returns {number}
 */
export const parseCocId = (id) => parseInt(id.slice(1), 10);
```

**Step 4: Run test to verify it passes**

Run: `node test/test-scriptcanon.js`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add src/scriptcanon.mjs test/test-scriptcanon.js
git commit -m "feat(canon): add ID utilities for COC verse_ids"
```

---

## Task 2: Create stub coc-mapping.mjs with sample data

**Files:**
- Create: `data/coc-mapping.mjs`

**Step 1: Write test for mapping import**

Add to `test/test-scriptcanon.js`:

```javascript
import cocMapping from '../data/coc-mapping.mjs';

test('coc-mapping has cocToLds object', () => {
  if (typeof cocMapping.cocToLds !== 'object') throw new Error('Missing cocToLds');
});

test('coc-mapping has ldsToCoc object', () => {
  if (typeof cocMapping.ldsToCoc !== 'object') throw new Error('Missing ldsToCoc');
});

test('coc-mapping sample entry exists', () => {
  if (!cocMapping.cocToLds[1]) throw new Error('Missing entry for COC verse 1');
});
```

**Step 2: Run test to verify it fails**

Run: `node test/test-scriptcanon.js`
Expected: FAIL with "Cannot find module '../data/coc-mapping.mjs'"

**Step 3: Write stub mapping file**

```javascript
// data/coc-mapping.mjs
// Stub mapping data - will be replaced by build script

export default {
  // COC → LDS mapping
  // Key: COC sequential number, Value: { lds: [verse_ids], partial: boolean }
  cocToLds: {
    1: { lds: [31103, 31104], partial: true },  // COC 1 Ne 1:1 = LDS 1 Ne 1:1-2
    2: { lds: [31105], partial: false },
    3: { lds: [31106], partial: false },
  },

  // LDS → COC mapping (reverse index)
  // Key: LDS verse_id, Value: { coc: [numbers], partial: boolean }
  ldsToCoc: {
    31103: { coc: [1], partial: true },
    31104: { coc: [1], partial: true },
    31105: { coc: [2], partial: false },
    31106: { coc: [3], partial: false },
  }
};
```

**Step 4: Run test to verify it passes**

Run: `node test/test-scriptcanon.js`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add data/coc-mapping.mjs test/test-scriptcanon.js
git commit -m "feat(canon): add stub coc-mapping.mjs with sample data"
```

---

## Task 3: Implement convertToLds function

**Files:**
- Modify: `src/scriptcanon.mjs`
- Modify: `test/test-scriptcanon.js`

**Step 1: Write failing tests**

Add to `test/test-scriptcanon.js`:

```javascript
import { convertToLds } from '../src/scriptcanon.mjs';

test('convertToLds converts single COC id', () => {
  const result = convertToLds(['C00002']);
  if (result.verse_ids[0] !== 31105) throw new Error(`Expected 31105, got ${result.verse_ids[0]}`);
  if (result.partial !== false) throw new Error('Expected partial: false');
});

test('convertToLds expands partial mapping', () => {
  const result = convertToLds(['C00001']);
  if (result.verse_ids.length !== 2) throw new Error(`Expected 2 verses, got ${result.verse_ids.length}`);
  if (result.verse_ids[0] !== 31103) throw new Error('Expected 31103 first');
  if (result.verse_ids[1] !== 31104) throw new Error('Expected 31104 second');
  if (result.partial !== true) throw new Error('Expected partial: true');
});

test('convertToLds handles multiple COC ids', () => {
  const result = convertToLds(['C00001', 'C00002']);
  if (result.verse_ids.length !== 3) throw new Error(`Expected 3 verses, got ${result.verse_ids.length}`);
  if (result.partial !== true) throw new Error('Expected partial: true (from C00001)');
});

test('convertToLds returns empty for unknown id', () => {
  const result = convertToLds(['C99999']);
  if (result.verse_ids.length !== 0) throw new Error('Expected empty array');
});
```

**Step 2: Run test to verify it fails**

Run: `node test/test-scriptcanon.js`
Expected: FAIL with "convertToLds is not a function" or similar

**Step 3: Implement convertToLds**

Add to `src/scriptcanon.mjs`:

```javascript
import cocMapping from '../data/coc-mapping.mjs';

/**
 * Convert COC verse_ids to LDS verse_ids
 * @param {string[]} cocIds - Array of COC ids like ['C00001', 'C00002']
 * @returns {{ verse_ids: number[], partial: boolean }}
 */
export const convertToLds = (cocIds) => {
  const result = { verse_ids: [], partial: false };

  for (const cocId of cocIds) {
    const num = parseCocId(cocId);
    const mapping = cocMapping.cocToLds[num];

    if (mapping) {
      result.verse_ids.push(...mapping.lds);
      if (mapping.partial) result.partial = true;
    }
  }

  return result;
};
```

**Step 4: Run test to verify it passes**

Run: `node test/test-scriptcanon.js`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add src/scriptcanon.mjs test/test-scriptcanon.js
git commit -m "feat(canon): implement convertToLds function"
```

---

## Task 4: Implement convertToCoc function

**Files:**
- Modify: `src/scriptcanon.mjs`
- Modify: `test/test-scriptcanon.js`

**Step 1: Write failing tests**

Add to `test/test-scriptcanon.js`:

```javascript
import { convertToCoc } from '../src/scriptcanon.mjs';

test('convertToCoc converts single LDS id', () => {
  const result = convertToCoc([31105]);
  if (result.verse_ids[0] !== 'C00002') throw new Error(`Expected C00002, got ${result.verse_ids[0]}`);
  if (result.partial !== false) throw new Error('Expected partial: false');
});

test('convertToCoc deduplicates partial mappings', () => {
  // Both 31103 and 31104 map to COC 1
  const result = convertToCoc([31103, 31104]);
  if (result.verse_ids.length !== 1) throw new Error(`Expected 1 verse, got ${result.verse_ids.length}`);
  if (result.verse_ids[0] !== 'C00001') throw new Error('Expected C00001');
  if (result.partial !== true) throw new Error('Expected partial: true');
});

test('convertToCoc handles multiple LDS ids', () => {
  const result = convertToCoc([31105, 31106]);
  if (result.verse_ids.length !== 2) throw new Error(`Expected 2 verses, got ${result.verse_ids.length}`);
});

test('convertToCoc returns empty for unknown id', () => {
  const result = convertToCoc([999999]);
  if (result.verse_ids.length !== 0) throw new Error('Expected empty array');
});
```

**Step 2: Run test to verify it fails**

Run: `node test/test-scriptcanon.js`
Expected: FAIL with "convertToCoc is not a function"

**Step 3: Implement convertToCoc**

Add to `src/scriptcanon.mjs`:

```javascript
/**
 * Convert LDS verse_ids to COC verse_ids
 * @param {number[]} ldsIds - Array of LDS verse_ids
 * @returns {{ verse_ids: string[], partial: boolean }}
 */
export const convertToCoc = (ldsIds) => {
  const result = { verse_ids: [], partial: false };
  const seen = new Set();

  for (const ldsId of ldsIds) {
    const mapping = cocMapping.ldsToCoc[ldsId];

    if (mapping) {
      for (const cocNum of mapping.coc) {
        if (!seen.has(cocNum)) {
          seen.add(cocNum);
          result.verse_ids.push(formatCocId(cocNum));
        }
      }
      if (mapping.partial) result.partial = true;
    }
  }

  return result;
};
```

**Step 4: Run test to verify it passes**

Run: `node test/test-scriptcanon.js`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add src/scriptcanon.mjs test/test-scriptcanon.js
git commit -m "feat(canon): implement convertToCoc function"
```

---

## Task 5: Implement convertCanon unified function

**Files:**
- Modify: `src/scriptcanon.mjs`
- Modify: `test/test-scriptcanon.js`

**Step 1: Write failing tests**

Add to `test/test-scriptcanon.js`:

```javascript
import { convertCanon } from '../src/scriptcanon.mjs';

test('convertCanon auto-detects COC and converts to LDS', () => {
  const result = convertCanon(['C00002'], { to: 'lds' });
  if (result.verse_ids[0] !== 31105) throw new Error('Expected 31105');
});

test('convertCanon auto-detects LDS and converts to COC', () => {
  const result = convertCanon([31105], { to: 'coc' });
  if (result.verse_ids[0] !== 'C00002') throw new Error('Expected C00002');
});

test('convertCanon returns error for mixed input', () => {
  const result = convertCanon(['C00001', 31105], { to: 'lds' });
  if (!result.error) throw new Error('Expected error for mixed input');
  if (result.error !== 'mixed_canon_input') throw new Error('Expected mixed_canon_input error');
});

test('convertCanon returns error for same-canon conversion', () => {
  const result = convertCanon(['C00001'], { to: 'coc' });
  if (!result.error) throw new Error('Expected error for same-canon');
});
```

**Step 2: Run test to verify it fails**

Run: `node test/test-scriptcanon.js`
Expected: FAIL

**Step 3: Implement convertCanon**

Add to `src/scriptcanon.mjs`:

```javascript
/**
 * Convert verse_ids between canons
 * Auto-detects source canon from ID format
 * @param {(string|number)[]} verseIds
 * @param {{ to: 'lds'|'coc' }} options
 * @returns {{ verse_ids: (string|number)[], partial: boolean, error?: string }}
 */
export const convertCanon = (verseIds, options = {}) => {
  const { to } = options;

  if (!to) {
    return { verse_ids: [], partial: false, error: 'missing_target_canon' };
  }

  // Detect canons of all inputs
  const canons = verseIds.map(detectCanon);
  const uniqueCanons = [...new Set(canons.filter(c => c !== null))];

  // Check for mixed input
  if (uniqueCanons.length > 1) {
    return { verse_ids: [], partial: false, error: 'mixed_canon_input' };
  }

  const sourceCanon = uniqueCanons[0];

  // Check for same-canon conversion
  if (sourceCanon === to) {
    return { verse_ids: [], partial: false, error: 'same_canon_conversion' };
  }

  // Perform conversion
  if (to === 'lds') {
    return convertToLds(verseIds);
  } else {
    return convertToCoc(verseIds);
  }
};
```

**Step 4: Run test to verify it passes**

Run: `node test/test-scriptcanon.js`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add src/scriptcanon.mjs test/test-scriptcanon.js
git commit -m "feat(canon): implement convertCanon unified function"
```

---

## Task 6: Create build script for mapping generation

**Files:**
- Create: `build/generate-coc-mapping.cjs`

**Step 1: Create the build script**

```javascript
// build/generate-coc-mapping.cjs
const fs = require('fs');
const path = require('path');

const BOOKS = [
  { slug: '1nephi', name: '1 Nephi' },
  { slug: '2nephi', name: '2 Nephi' },
  { slug: 'jacob', name: 'Jacob' },
  { slug: 'enos', name: 'Enos' },
  { slug: 'jarom', name: 'Jarom' },
  { slug: 'omni', name: 'Omni' },
  { slug: 'wofm', name: 'Words of Mormon' },
  { slug: 'mosiah', name: 'Mosiah' },
  { slug: 'alma', name: 'Alma' },
  { slug: 'helaman', name: 'Helaman' },
  { slug: '3nephi', name: '3 Nephi' },
  { slug: '4nephi', name: '4 Nephi' },
  { slug: 'mormon', name: 'Mormon' },
  { slug: 'ether', name: 'Ether' },
  { slug: 'moroni', name: 'Moroni' }
];

// Parse LDS data from lds.txt
const parseLdsFile = (filepath) => {
  const content = fs.readFileSync(filepath, 'utf-8');
  const lines = content.split('\n').slice(1); // skip header
  const verses = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    const parts = line.split('\t');
    const verse_id = parseInt(parts[0]);
    const book_id = parseInt(parts[2]);
    const chapter = parseInt(parts[3]);
    const verse = parseInt(parts[4]);
    const text = parts[6] || '';

    // Book IDs 67-81 are Book of Mormon (1 Nephi through Moroni)
    if (book_id >= 67 && book_id <= 81) {
      verses.push({
        verse_id,
        book_id,
        chapter,
        verse,
        text: normalizeText(text)
      });
    }
  }

  return verses;
};

// Normalize text for comparison
const normalizeText = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 150);
};

// Fetch RLDS book from centerplace.org
const fetchRldsBook = async (slug) => {
  const url = `https://centerplace.org/hs/bm/${slug}.htm`;
  console.log(`  Fetching ${url}...`);

  const response = await fetch(url);
  const html = await response.text();
  return parseRldsHtml(html);
};

// Parse RLDS HTML to extract verses
const parseRldsHtml = (html) => {
  const verses = [];

  // Pattern: chapter:verse followed by text
  // Example: "1:1 I, Nephi, having been born..."
  const pattern = /(\d+):(\d+)\s+([^<\n]+)/g;
  let match;

  while ((match = pattern.exec(html)) !== null) {
    verses.push({
      chapter: parseInt(match[1]),
      verse: parseInt(match[2]),
      text: normalizeText(match[3])
    });
  }

  return verses;
};

// Calculate Jaccard similarity between two texts
const textSimilarity = (a, b) => {
  if (!a || !b) return 0;
  const wordsA = new Set(a.split(' ').filter(w => w.length > 2));
  const wordsB = new Set(b.split(' ').filter(w => w.length > 2));
  const intersection = [...wordsA].filter(x => wordsB.has(x)).length;
  const union = new Set([...wordsA, ...wordsB]).size;
  return union > 0 ? intersection / union : 0;
};

// Align verses using text similarity
const alignVerses = (ldsVerses, rldsVerses) => {
  const cocToLds = {};
  const ldsToCoc = {};

  let ldsIndex = 0;

  for (let cocIndex = 0; cocIndex < rldsVerses.length; cocIndex++) {
    const rlds = rldsVerses[cocIndex];
    const cocNum = cocIndex + 1; // 1-indexed

    // Find matching LDS verse(s)
    const matches = [];
    let bestSim = 0;

    // Look ahead up to 3 verses
    for (let i = ldsIndex; i < Math.min(ldsIndex + 3, ldsVerses.length); i++) {
      const sim = textSimilarity(rlds.text, ldsVerses[i].text);
      if (sim > 0.3) {
        matches.push(ldsVerses[i]);
        if (sim > bestSim) bestSim = sim;
      }
    }

    // If no good match, just take the next LDS verse
    if (matches.length === 0 && ldsIndex < ldsVerses.length) {
      matches.push(ldsVerses[ldsIndex]);
    }

    // Record mapping
    const ldsIds = matches.map(m => m.verse_id);
    const partial = matches.length !== 1;

    cocToLds[cocNum] = { lds: ldsIds, partial };

    // Build reverse index
    for (const ldsVerse of matches) {
      if (!ldsToCoc[ldsVerse.verse_id]) {
        ldsToCoc[ldsVerse.verse_id] = { coc: [], partial: false };
      }
      if (!ldsToCoc[ldsVerse.verse_id].coc.includes(cocNum)) {
        ldsToCoc[ldsVerse.verse_id].coc.push(cocNum);
      }
      if (partial) {
        ldsToCoc[ldsVerse.verse_id].partial = true;
      }
    }

    // Advance LDS index
    if (matches.length > 0) {
      const lastMatch = matches[matches.length - 1];
      const lastIdx = ldsVerses.findIndex(v => v.verse_id === lastMatch.verse_id);
      if (lastIdx >= ldsIndex) {
        ldsIndex = lastIdx + 1;
      }
    }
  }

  return { cocToLds, ldsToCoc };
};

// Main generation function
const generateMapping = async () => {
  console.log('=== COC Mapping Generator ===\n');

  // Parse LDS data
  console.log('Step 1: Parsing LDS data from lds.txt...');
  const ldsPath = path.join(__dirname, '..', 'lds.txt');

  if (!fs.existsSync(ldsPath)) {
    console.error('ERROR: lds.txt not found at', ldsPath);
    process.exit(1);
  }

  const ldsVerses = parseLdsFile(ldsPath);
  console.log(`  Found ${ldsVerses.length} LDS Book of Mormon verses\n`);

  // Fetch RLDS data
  console.log('Step 2: Fetching RLDS data from centerplace.org...');
  const allRlds = [];

  for (const book of BOOKS) {
    try {
      const verses = await fetchRldsBook(book.slug);
      console.log(`    ${book.name}: ${verses.length} verses`);
      allRlds.push(...verses);
    } catch (err) {
      console.error(`    ERROR fetching ${book.name}: ${err.message}`);
    }
  }

  console.log(`  Total RLDS verses: ${allRlds.length}\n`);

  // Align verses
  console.log('Step 3: Aligning verses...');
  const { cocToLds, ldsToCoc } = alignVerses(ldsVerses, allRlds);
  console.log(`  Mapped ${Object.keys(cocToLds).length} COC verses\n`);

  // Write output
  console.log('Step 4: Writing data/coc-mapping.mjs...');
  const output = `// Auto-generated COC↔LDS mapping
// Generated: ${new Date().toISOString()}
// DO NOT EDIT - regenerate with: node build/generate-coc-mapping.cjs

export default {
  cocToLds: ${JSON.stringify(cocToLds, null, 2)},
  ldsToCoc: ${JSON.stringify(ldsToCoc, null, 2)}
};
`;

  const outPath = path.join(__dirname, '..', 'data', 'coc-mapping.mjs');
  fs.writeFileSync(outPath, output);
  console.log(`  Written to ${outPath}\n`);

  // Summary
  const partialCount = Object.values(cocToLds).filter(m => m.partial).length;
  console.log('=== Summary ===');
  console.log(`Total COC verses: ${Object.keys(cocToLds).length}`);
  console.log(`Partial mappings: ${partialCount}`);
  console.log(`Exact mappings: ${Object.keys(cocToLds).length - partialCount}`);
  console.log('\nDone!');
};

generateMapping().catch(err => {
  console.error('Generation failed:', err);
  process.exit(1);
});
```

**Step 2: Run the script**

Run: `node build/generate-coc-mapping.cjs`
Expected: Script fetches data and generates `data/coc-mapping.mjs`

**Step 3: Verify generated file**

Run: `head -50 data/coc-mapping.mjs`
Expected: See generated mapping with actual verse data

**Step 4: Run tests with real data**

Run: `node test/test-scriptcanon.js`
Expected: Tests may need adjustment for real data

**Step 5: Commit**

```bash
git add build/generate-coc-mapping.cjs data/coc-mapping.mjs
git commit -m "feat(canon): add build script and generate real COC mapping"
```

---

## Task 7: Add npm script for mapping generation

**Files:**
- Modify: `package.json`

**Step 1: Add script to package.json**

Add to "scripts" section:

```json
"generate-coc-mapping": "node build/generate-coc-mapping.cjs"
```

**Step 2: Verify script works**

Run: `npm run generate-coc-mapping`
Expected: Same output as direct node command

**Step 3: Commit**

```bash
git add package.json
git commit -m "chore: add npm script for COC mapping generation"
```

---

## Task 8: Integrate canon support into lookupReference

**Files:**
- Modify: `src/scriptures.mjs`
- Create: `test/test-canon-integration.js`

**Step 1: Write integration tests**

```javascript
// test/test-canon-integration.js
import { lookupReference, generateReference } from '../src/scriptures.mjs';

const tests = [];
const test = (name, fn) => tests.push({ name, fn });
const run = () => {
  let passed = 0, failed = 0;
  for (const t of tests) {
    try {
      t.fn();
      console.log(`✓ ${t.name}`);
      passed++;
    } catch (e) {
      console.log(`✗ ${t.name}: ${e.message}`);
      failed++;
    }
  }
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
};

// Basic LDS lookup (unchanged behavior)
test('lookupReference works without canon option (LDS default)', () => {
  const result = lookupReference('1 Nephi 1:1');
  if (!result.verse_ids.includes(31103)) throw new Error('Expected verse_id 31103');
});

// COC lookup
test('lookupReference with canon:"coc" returns C-prefixed ids', () => {
  const result = lookupReference('1 Nephi 1:1', 'en', { canon: 'coc' });
  if (!result.verse_ids[0]?.startsWith('C')) throw new Error('Expected C-prefixed id');
});

// convertTo option
test('lookupReference with convertTo converts result', () => {
  const result = lookupReference('1 Nephi 1:1', 'en', { canon: 'coc', convertTo: 'lds' });
  if (typeof result.verse_ids[0] !== 'number') throw new Error('Expected LDS integer id');
  if (result.sourceCanon !== 'coc') throw new Error('Expected sourceCanon: coc');
});

// includeParallel option
test('lookupReference with includeParallel includes both canons', () => {
  const result = lookupReference('1 Nephi 1:1', 'en', { canon: 'coc', includeParallel: true });
  if (!result.parallel) throw new Error('Expected parallel object');
  if (result.parallel.canon !== 'lds') throw new Error('Expected parallel.canon: lds');
});

// generateReference with COC ids
test('generateReference auto-detects COC ids', () => {
  const result = generateReference(['C00001', 'C00002']);
  if (!result.includes('1 Nephi')) throw new Error('Expected 1 Nephi in result');
});

run();
```

**Step 2: Run tests to verify they fail**

Run: `node test/test-canon-integration.js`
Expected: FAIL (canon option not implemented yet)

**Step 3: Implement canon support in scriptures.mjs**

Modify `src/scriptures.mjs`:

1. Add imports at top:
```javascript
import { detectCanon, convertToLds, convertToCoc, formatCocId } from './scriptcanon.mjs';
import cocData from '../data/coc.mjs';
```

2. Modify `lookupReference` function to accept and handle options:
```javascript
const lookupReference = function(query, language = null, options = {}) {
    const { canon = 'lds', convertTo, includeParallel } = options;

    // ... existing validation ...

    const effectiveLanguage = getEffectiveLanguage(language);

    // Select config based on canon
    let verse_ids;
    if (canon === 'coc') {
        verse_ids = lookupInLanguageCoc(query, effectiveLanguage);
    } else {
        verse_ids = lookupInLanguage(query, effectiveLanguage);
    }

    if (!verse_ids?.length) {
        // ... existing fallback logic ...
    }

    let result = {
        query,
        ref: generateReference(verse_ids, effectiveLanguage, { canon }),
        verse_ids
    };

    // Handle conversion
    if (convertTo && convertTo !== canon) {
        const converted = convertTo === 'lds'
            ? convertToLds(verse_ids)
            : convertToCoc(verse_ids);
        result.verse_ids = converted.verse_ids;
        result.partial = converted.partial;
        result.sourceCanon = canon;
        result.ref = generateReference(converted.verse_ids, effectiveLanguage, { canon: convertTo });
    }

    // Handle parallel
    if (includeParallel) {
        const targetCanon = canon === 'lds' ? 'coc' : 'lds';
        const converted = targetCanon === 'coc'
            ? convertToCoc(verse_ids)
            : convertToLds(verse_ids);
        result.parallel = {
            canon: targetCanon,
            ref: generateReference(converted.verse_ids, effectiveLanguage, { canon: targetCanon }),
            verse_ids: converted.verse_ids,
            partial: converted.partial
        };
    }

    return result;
};
```

3. Add COC-specific lookup function:
```javascript
const lookupInLanguageCoc = function(query, language) {
    const config = getLanguageConfigCoc(language);
    let ref = cleanReference(query, config);
    let refs = splitReferences(ref, config);

    let verse_ids = [];
    for (let i in refs) {
        const ids = lookupSingleRefCoc(refs[i], config);
        verse_ids = verse_ids.concat(ids);
    }

    return verse_ids;
};

const getLanguageConfigCoc = function(language) {
    // Build COC config similar to LDS but with COC book structure
    const config = getLanguageConfig(language);
    config.raw_index = buildCocIndex();
    return config;
};

const buildCocIndex = function() {
    // Convert cocData.books to same format as raw_index
    return cocData.books;
};

const lookupSingleRefCoc = function(ref, config) {
    let book = getBook(ref, config);
    if (!book) return [];
    let ranges = getRanges(ref, book);
    let verse_ids = loadVerseIdsCoc(book, ranges, config);
    return verse_ids;
};

const loadVerseIdsCoc = function(book, ranges, config) {
    // Similar to loadVerseIds but returns C-prefixed IDs
    const refIndex = loadRefIndexCoc(config);
    let verseList = [];

    for (let i in ranges) {
        let range = ranges[i];
        let matches = range.match(/(\d+): *([\dX]+)-*([\dX]*)/);
        if (!matches) continue;

        let chapter = parseInt(matches[1]);
        let start = parseInt(matches[2]);
        let end = matches[3];
        if (end == '') end = start;
        if (end == "X") end = loadMaxVerseCoc(book, chapter, config);
        else end = parseInt(end);

        for (let verse_num = start; verse_num <= end; verse_num++) {
            if (refIndex[book]?.[chapter]?.[verse_num]) {
                verseList.push(formatCocId(refIndex[book][chapter][verse_num]));
            }
        }
    }

    return verseList;
};

const loadRefIndexCoc = function(config) {
    let refIndex = {};
    let verse_id = 1;
    let book_list = Object.keys(config.raw_index);

    for (let a in book_list) {
        let book_title = book_list[a];
        refIndex[book_title] = {};

        for (let b in config.raw_index[book_title]) {
            let chapter_num = parseInt(b) + 1;
            let verse_max = config.raw_index[book_title][b];
            refIndex[book_title][chapter_num] = {};

            for (var verse_num = 1; verse_num <= verse_max; verse_num++) {
                refIndex[book_title][chapter_num][verse_num] = verse_id;
                verse_id++;
            }
        }
    }

    return refIndex;
};

const loadMaxVerseCoc = function(book, chapter, config) {
    if (!config.raw_index[book]) return 0;
    return config.raw_index[book][parseInt(chapter) - 1];
};
```

4. Modify `generateReference` to handle COC:
```javascript
const generateReference = function(verse_ids, language = null, options = {}) {
    const { canon = 'lds' } = options;

    verse_ids = validateVerseIds(verse_ids, canon);
    if (!verse_ids) return '';

    const effectiveLanguage = getEffectiveLanguage(language);

    if (canon === 'coc' || (verse_ids[0] && detectCanon(verse_ids[0]) === 'coc')) {
        return generateReferenceCoc(verse_ids, effectiveLanguage);
    }

    // ... existing LDS logic ...
};

const generateReferenceCoc = function(verse_ids, language) {
    // Convert C-prefixed IDs to structure, then generate ref string
    // Implementation similar to LDS but using COC index
    // ...
};
```

**Step 4: Run tests**

Run: `node test/test-canon-integration.js`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add src/scriptures.mjs test/test-canon-integration.js
git commit -m "feat(canon): integrate COC support into lookupReference and generateReference"
```

---

## Task 9: Export convertCanon from main module

**Files:**
- Modify: `src/scriptures.mjs`

**Step 1: Add to exports**

Add to export block in `src/scriptures.mjs`:

```javascript
import { convertCanon } from './scriptcanon.mjs';

export {
    // ... existing exports ...

    convertCanon,
    convertCanon as convert,
    convertCanon as translateCanon,
};
```

**Step 2: Write test**

Add to `test/test-canon-integration.js`:

```javascript
import { convertCanon } from '../src/scriptures.mjs';

test('convertCanon is exported from main module', () => {
  if (typeof convertCanon !== 'function') throw new Error('Expected function');
});

test('convertCanon works via main export', () => {
  const result = convertCanon([31103], { to: 'coc' });
  if (!result.verse_ids[0]?.startsWith('C')) throw new Error('Expected C-prefixed id');
});
```

**Step 3: Run tests**

Run: `node test/test-canon-integration.js`
Expected: All tests PASS

**Step 4: Commit**

```bash
git add src/scriptures.mjs test/test-canon-integration.js
git commit -m "feat(canon): export convertCanon from main module"
```

---

## Task 10: Rebuild distribution files

**Files:**
- Run build script

**Step 1: Run build**

Run: `npm run build`
Expected: Build succeeds, dist files updated

**Step 2: Verify exports work in built files**

```bash
node -e "const s = require('./dist/scriptures.cjs'); console.log(typeof s.convertCanon)"
```
Expected: Output "function"

**Step 3: Commit**

```bash
git add dist/
git commit -m "chore: rebuild distribution files with COC support"
```

---

## Task 11: Final integration test

**Files:**
- Create: `test/test-coc-full.js`

**Step 1: Write comprehensive test**

```javascript
// test/test-coc-full.js
import { lookupReference, generateReference, convertCanon } from '../src/scriptures.mjs';

console.log('=== COC Adapter Full Integration Test ===\n');

// Test 1: Basic COC lookup
console.log('Test 1: COC lookup');
const coc1 = lookupReference('1 Nephi 1:1', 'en', { canon: 'coc' });
console.log('  Input: 1 Nephi 1:1 (COC)');
console.log('  Result:', coc1);

// Test 2: COC with parallel
console.log('\nTest 2: COC with parallel');
const coc2 = lookupReference('1 Nephi 1:1', 'en', { canon: 'coc', includeParallel: true });
console.log('  COC verse_ids:', coc2.verse_ids);
console.log('  LDS parallel:', coc2.parallel);

// Test 3: COC to LDS conversion
console.log('\nTest 3: COC to LDS conversion');
const coc3 = lookupReference('1 Nephi 1:50', 'en', { canon: 'coc', convertTo: 'lds' });
console.log('  Input: 1 Nephi 1:50 (COC)');
console.log('  LDS ref:', coc3.ref);
console.log('  LDS verse_ids:', coc3.verse_ids);
console.log('  Partial:', coc3.partial);

// Test 4: LDS to COC conversion
console.log('\nTest 4: LDS to COC conversion');
const lds1 = lookupReference('1 Nephi 2:1', 'en', { includeParallel: true });
console.log('  Input: 1 Nephi 2:1 (LDS)');
console.log('  COC parallel:', lds1.parallel);

// Test 5: convertCanon standalone
console.log('\nTest 5: convertCanon standalone');
const conv1 = convertCanon([31103, 31104], { to: 'coc' });
console.log('  LDS [31103, 31104] → COC:', conv1);

// Test 6: Generate COC reference
console.log('\nTest 6: Generate COC reference');
const ref1 = generateReference(['C00001', 'C00002', 'C00003']);
console.log('  C00001-C00003 →', ref1);

console.log('\n=== All tests completed ===');
```

**Step 2: Run full test**

Run: `node test/test-coc-full.js`
Expected: All operations complete with reasonable output

**Step 3: Commit**

```bash
git add test/test-coc-full.js
git commit -m "test: add full COC integration test"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | ID utilities | scriptcanon.mjs |
| 2 | Stub mapping | coc-mapping.mjs |
| 3 | convertToLds | scriptcanon.mjs |
| 4 | convertToCoc | scriptcanon.mjs |
| 5 | convertCanon | scriptcanon.mjs |
| 6 | Build script | generate-coc-mapping.cjs |
| 7 | npm script | package.json |
| 8 | Integration | scriptures.mjs |
| 9 | Export | scriptures.mjs |
| 10 | Rebuild dist | dist/* |
| 11 | Full test | test-coc-full.js |
