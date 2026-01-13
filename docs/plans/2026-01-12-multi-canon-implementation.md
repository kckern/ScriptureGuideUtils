# Multi-Canon Architecture Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor scripture-guide to support multiple canons with YAML-based data files, flexible API, and cross-canon features.

**Architecture:** Canon-first file organization with shared language patterns. YAML files define structure and book names, compiled to JS for production. API accepts string (language or canon) or config object with fuzzy canon matching on by default.

**Tech Stack:** js-yaml for parsing, Node.js build scripts, Jest for testing

**Design Doc:** `docs/plans/2026-01-12-multi-canon-architecture-design.md`

**TDD Approach:** Each task writes failing tests first, then implements to pass. Existing tests provide regression safety.

---

## Phase 1: YAML Infrastructure

### Task 1.1: Add js-yaml Dependency

**Files:**
- Modify: `package.json`

**Step 1: Add dependency**

Run:
```bash
npm install js-yaml
```

**Step 2: Verify installation**

Run:
```bash
node -e "require('js-yaml'); console.log('js-yaml OK')"
```
Expected: `js-yaml OK`

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add js-yaml dependency for YAML config files"
```

---

### Task 1.2: Create YAML Loader Module

**Files:**
- Create: `src/lib/yaml-loader.mjs`
- Create: `test/unit/yaml-loader.test.js`

**Step 1: Write failing test**

```javascript
// test/unit/yaml-loader.test.js
import { loadYaml, yamlExists } from '../../src/lib/yaml-loader.mjs';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

const TEST_DIR = 'test/fixtures/_yaml-test';

describe('YAML Loader', () => {
  beforeAll(() => {
    mkdirSync(TEST_DIR, { recursive: true });
    writeFileSync(join(TEST_DIR, 'simple.yml'), 'name: test\nvalue: 42');
  });

  afterAll(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
  });

  test('loadYaml parses YAML file', () => {
    const result = loadYaml(join(TEST_DIR, 'simple.yml'));
    expect(result).toEqual({ name: 'test', value: 42 });
  });

  test('loadYaml returns null for missing file', () => {
    const result = loadYaml(join(TEST_DIR, 'nonexistent.yml'));
    expect(result).toBeNull();
  });

  test('yamlExists returns true for existing file', () => {
    expect(yamlExists(join(TEST_DIR, 'simple.yml'))).toBe(true);
  });

  test('yamlExists returns false for missing file', () => {
    expect(yamlExists(join(TEST_DIR, 'nonexistent.yml'))).toBe(false);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:jest -- --testPathPattern="yaml-loader" -v`
Expected: FAIL with "Cannot find module"

**Step 3: Write minimal implementation**

```javascript
// src/lib/yaml-loader.mjs
import { readFileSync, existsSync } from 'fs';
import yaml from 'js-yaml';

/**
 * Load and parse a YAML file
 * @param {string} filePath - Path to YAML file
 * @returns {Object|null} Parsed YAML or null if file doesn't exist
 */
export function loadYaml(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }
  const content = readFileSync(filePath, 'utf8');
  return yaml.load(content);
}

/**
 * Check if a YAML file exists
 * @param {string} filePath - Path to YAML file
 * @returns {boolean}
 */
export function yamlExists(filePath) {
  return existsSync(filePath);
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test:jest -- --testPathPattern="yaml-loader" -v`
Expected: PASS (4 tests)

**Step 5: Commit**

```bash
git add src/lib/yaml-loader.mjs test/unit/yaml-loader.test.js
git commit -m "feat: add YAML loader module"
```

---

### Task 1.3: Add Deep Merge Utility

**Files:**
- Create: `src/lib/deep-merge.mjs`
- Create: `test/unit/deep-merge.test.js`

**Step 1: Write failing test**

```javascript
// test/unit/deep-merge.test.js
import { deepMerge } from '../../src/lib/deep-merge.mjs';

describe('deepMerge', () => {
  test('merges flat objects', () => {
    const a = { x: 1, y: 2 };
    const b = { y: 3, z: 4 };
    expect(deepMerge(a, b)).toEqual({ x: 1, y: 3, z: 4 });
  });

  test('merges nested objects', () => {
    const a = { outer: { inner: 1, keep: 2 } };
    const b = { outer: { inner: 3 } };
    expect(deepMerge(a, b)).toEqual({ outer: { inner: 3, keep: 2 } });
  });

  test('arrays are replaced, not merged', () => {
    const a = { items: [1, 2, 3] };
    const b = { items: [4, 5] };
    expect(deepMerge(a, b)).toEqual({ items: [4, 5] });
  });

  test('handles null and undefined', () => {
    const a = { x: 1 };
    expect(deepMerge(a, null)).toEqual({ x: 1 });
    expect(deepMerge(null, a)).toEqual({ x: 1 });
    expect(deepMerge(a, undefined)).toEqual({ x: 1 });
  });

  test('merges multiple objects left to right', () => {
    const a = { x: 1 };
    const b = { y: 2 };
    const c = { x: 3, z: 4 };
    expect(deepMerge(a, b, c)).toEqual({ x: 3, y: 2, z: 4 });
  });

  test('does not mutate original objects', () => {
    const a = { x: 1, nested: { y: 2 } };
    const b = { x: 2, nested: { z: 3 } };
    const result = deepMerge(a, b);
    expect(a).toEqual({ x: 1, nested: { y: 2 } });
    expect(b).toEqual({ x: 2, nested: { z: 3 } });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:jest -- --testPathPattern="deep-merge" -v`
Expected: FAIL with "Cannot find module"

**Step 3: Write minimal implementation**

```javascript
// src/lib/deep-merge.mjs
/**
 * Deep merge multiple objects (left to right)
 * Arrays are replaced, not concatenated
 * @param  {...Object} objects - Objects to merge
 * @returns {Object} Merged object
 */
export function deepMerge(...objects) {
  const result = {};

  for (const obj of objects) {
    if (obj == null) continue;

    for (const [key, value] of Object.entries(obj)) {
      if (
        value !== null &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        result[key] !== null &&
        typeof result[key] === 'object' &&
        !Array.isArray(result[key])
      ) {
        result[key] = deepMerge(result[key], value);
      } else {
        result[key] = Array.isArray(value) ? [...value] : value;
      }
    }
  }

  return result;
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test:jest -- --testPathPattern="deep-merge" -v`
Expected: PASS (6 tests)

**Step 5: Commit**

```bash
git add src/lib/deep-merge.mjs test/unit/deep-merge.test.js
git commit -m "feat: add deep merge utility for config layering"
```

---

## Phase 2: Shared Language Files

### Task 2.1: Create Shared English YAML

**Files:**
- Create: `data/shared/en.yml`
- Create: `test/unit/shared-loader.test.js`

**Step 1: Write failing test**

```javascript
// test/unit/shared-loader.test.js
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
```

**Step 2: Run test to verify it fails**

Run: `npm run test:jest -- --testPathPattern="shared-loader" -v`
Expected: FAIL with "Cannot find module"

**Step 3: Create shared English YAML**

```yaml
# data/shared/en.yml
language: en

delimiters:
  chapter_verse: [":", "."]
  range: ["-", "–", "—", "through", "to"]
  list: [",", ";", "and"]

numerals:
  roman:
    I: 1
    II: 2
    III: 3
    IV: 4
  spelled:
    first: 1
    second: 2
    third: 3
    fourth: 4

labels:
  chapter: ["chapter", "ch", "chap"]
  verse: ["verse", "v", "vv", "vs"]

joiners:
  patterns: ["and", ";", ",", "compare", "see also", "cf"]

pre_rules:
  # Roman numerals before book names
  - pattern: "\\bIV\\s+(?=[A-Za-z])"
    replacement: "4 "
  - pattern: "\\bIII\\s+(?=[A-Za-z])"
    replacement: "3 "
  - pattern: "\\bII\\s+(?=[A-Za-z])"
    replacement: "2 "
  - pattern: "\\bI\\s+(?=[A-Za-z])"
    replacement: "1 "
  # Spelled ordinals
  - pattern: "\\bfirst\\s+(?=[A-Za-z])"
    replacement: "1 "
  - pattern: "\\bsecond\\s+(?=[A-Za-z])"
    replacement: "2 "
  - pattern: "\\bthird\\s+(?=[A-Za-z])"
    replacement: "3 "
  - pattern: "\\bfourth\\s+(?=[A-Za-z])"
    replacement: "4 "
  # Spelled delimiters
  - pattern: "\\bchapter\\s+(\\d+),?\\s*verse\\s+(\\d+)"
    replacement: "$1:$2"
  - pattern: "\\bchapter\\s+(\\d+),?\\s*verses?\\s+(\\d+)\\s*(?:through|to|-)\\s*(\\d+)"
    replacement: "$1:$2-$3"

post_rules:
  - pattern: "\\s+"
    replacement: " "
```

**Step 4: Write canon loader with shared loading**

```javascript
// src/lib/canon-loader.mjs
import { loadYaml } from './yaml-loader.mjs';
import { join } from 'path';

const DATA_DIR = 'data';

/**
 * Load shared language patterns
 * @param {string} langCode - Language code (e.g., 'en')
 * @returns {Object|null} Shared language config or null
 */
export function loadSharedLanguage(langCode) {
  const path = join(DATA_DIR, 'shared', `${langCode}.yml`);
  return loadYaml(path);
}
```

**Step 5: Run test to verify it passes**

Run: `npm run test:jest -- --testPathPattern="shared-loader" -v`
Expected: PASS (2 tests)

**Step 6: Commit**

```bash
git add data/shared/en.yml src/lib/canon-loader.mjs test/unit/shared-loader.test.js
git commit -m "feat: add shared English language patterns in YAML"
```

---

### Task 2.2: Create Shared Korean YAML

**Files:**
- Create: `data/shared/ko.yml`
- Modify: `test/unit/shared-loader.test.js`

**Step 1: Add failing test for Korean**

Add to `test/unit/shared-loader.test.js`:

```javascript
test('loads Korean shared patterns', () => {
  const shared = loadSharedLanguage('ko');

  expect(shared).not.toBeNull();
  expect(shared.language).toBe('ko');
  expect(shared.delimiters).toBeDefined();
  expect(shared.labels.chapter).toContain('장');
  expect(shared.labels.verse).toContain('절');
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:jest -- --testPathPattern="shared-loader" -v`
Expected: FAIL (Korean test)

**Step 3: Create shared Korean YAML**

```yaml
# data/shared/ko.yml
language: ko

delimiters:
  chapter_verse: [":", "장"]
  range: ["-", "~", "부터"]
  list: [",", ";", "과", "와", "및"]

numerals:
  spelled:
    제1: 1
    제2: 2
    제3: 3
    제4: 4

labels:
  chapter: ["장", "편"]
  verse: ["절"]

joiners:
  patterns: ["과", "와", "및", "그리고", "또는", "비교"]

pre_rules:
  - pattern: "(\\d+)\\s*장\\s*(\\d+)(?:~|-)(\\d+)\\s*절*"
    replacement: "$1:$2-$3"
  - pattern: "(\\d+)\\s*장\\s*(\\d+)\\s*절*"
    replacement: "$1:$2"
  - pattern: "~"
    replacement: "-"
  - pattern: "(비교|또는*|그리고|과|와|및)"
    replacement: ";"

post_rules:
  - pattern: "\\s+"
    replacement: " "
```

**Step 4: Run test to verify it passes**

Run: `npm run test:jest -- --testPathPattern="shared-loader" -v`
Expected: PASS (3 tests)

**Step 5: Commit**

```bash
git add data/shared/ko.yml test/unit/shared-loader.test.js
git commit -m "feat: add shared Korean language patterns in YAML"
```

---

## Phase 3: Canon Structure Files

### Task 3.1: Create Bible Structure YAML

**Files:**
- Create: `data/canons/bible/_structure.yml`
- Modify: `src/lib/canon-loader.mjs`
- Create: `test/unit/canon-structure.test.js`

**Step 1: Write failing test**

```javascript
// test/unit/canon-structure.test.js
import { loadCanonStructure } from '../../src/lib/canon-loader.mjs';

describe('Canon Structure Loading', () => {
  test('loads Bible structure', () => {
    const bible = loadCanonStructure('bible');

    expect(bible).not.toBeNull();
    expect(bible.canon).toBe('bible');
    expect(bible.id_start).toBe(1);
    expect(bible.id_end).toBe(31102);
    expect(bible.books).toBeDefined();
    expect(Array.isArray(bible.books)).toBe(true);
    expect(bible.books.length).toBe(66);

    // Check first book
    const genesis = bible.books.find(b => b.key === 'genesis');
    expect(genesis).toBeDefined();
    expect(genesis.order).toBe(1);
    expect(genesis.chapters).toBe(50);
    expect(genesis.first_verse_id).toBe(1);

    // Check last book
    const revelation = bible.books.find(b => b.key === 'revelation');
    expect(revelation).toBeDefined();
    expect(revelation.order).toBe(66);
  });

  test('returns null for unknown canon', () => {
    const unknown = loadCanonStructure('nonexistent');
    expect(unknown).toBeNull();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:jest -- --testPathPattern="canon-structure" -v`
Expected: FAIL

**Step 3: Add loadCanonStructure to canon-loader**

Add to `src/lib/canon-loader.mjs`:

```javascript
/**
 * Load canon structure (books, chapters, verse IDs)
 * @param {string} canonName - Canon name (e.g., 'bible', 'lds')
 * @returns {Object|null} Canon structure or null
 */
export function loadCanonStructure(canonName) {
  const path = join(DATA_DIR, 'canons', canonName, '_structure.yml');
  return loadYaml(path);
}
```

**Step 4: Create Bible structure YAML (abbreviated - full file has all 66 books)**

Create `data/canons/bible/_structure.yml` with the full Bible structure. Here's the template:

```yaml
# data/canons/bible/_structure.yml
canon: bible
name: "Holy Bible (KJV)"
description: "King James Version - 66 books, Genesis through Revelation"

id_format: integer
id_start: 1
id_end: 31102

books:
  - key: genesis
    order: 1
    chapters: 50
    verses: [31, 25, 24, 26, 32, 22, 24, 22, 29, 32, 32, 20, 18, 24, 21, 16, 27, 33, 38, 18, 34, 24, 20, 67, 34, 35, 46, 22, 35, 43, 55, 32, 20, 31, 29, 43, 36, 30, 23, 23, 57, 38, 34, 34, 28, 34, 31, 22, 33, 26]
    first_verse_id: 1

  - key: exodus
    order: 2
    chapters: 40
    verses: [22, 25, 22, 31, 23, 30, 25, 32, 35, 29, 10, 51, 22, 31, 27, 36, 16, 27, 25, 26, 36, 31, 33, 18, 40, 37, 21, 43, 46, 38, 18, 35, 23, 35, 35, 38, 29, 31, 43, 38]
    first_verse_id: 1534

  # ... (remaining 64 books - generate from existing scriptdata.mjs)

  - key: revelation
    order: 66
    chapters: 22
    verses: [20, 29, 22, 11, 14, 17, 17, 13, 21, 11, 19, 17, 18, 20, 8, 21, 18, 24, 21, 15, 27, 21]
    first_verse_id: 30699
```

**Note:** The full file should be generated from existing `data/scriptdata.mjs` using a migration script. For the test to pass, include all 66 books.

**Step 5: Run test to verify it passes**

Run: `npm run test:jest -- --testPathPattern="canon-structure" -v`
Expected: PASS (2 tests)

**Step 6: Commit**

```bash
git add data/canons/bible/_structure.yml src/lib/canon-loader.mjs test/unit/canon-structure.test.js
git commit -m "feat: add Bible canon structure in YAML"
```

---

### Task 3.2: Create LDS Structure with Extends

**Files:**
- Create: `data/canons/lds/_structure.yml`
- Modify: `src/lib/canon-loader.mjs`
- Modify: `test/unit/canon-structure.test.js`

**Step 1: Add failing test for LDS with extends**

Add to `test/unit/canon-structure.test.js`:

```javascript
test('loads LDS structure with extends', () => {
  const lds = loadCanonStructure('lds');

  expect(lds).not.toBeNull();
  expect(lds.canon).toBe('lds');
  expect(lds.extends).toBe('bible');
  expect(lds.id_start).toBe(31103);
  expect(lds.id_end).toBe(41995);

  // LDS-specific books
  const nephi1 = lds.books.find(b => b.key === '1_nephi');
  expect(nephi1).toBeDefined();
  expect(nephi1.first_verse_id).toBe(31103);
});

test('loadCanonWithInheritance merges parent canon', () => {
  const lds = loadCanonWithInheritance('lds');

  // Should have Bible books + LDS books
  expect(lds.books.length).toBeGreaterThan(66);

  // Genesis from Bible
  const genesis = lds.books.find(b => b.key === 'genesis');
  expect(genesis).toBeDefined();
  expect(genesis.first_verse_id).toBe(1);

  // 1 Nephi from LDS
  const nephi1 = lds.books.find(b => b.key === '1_nephi');
  expect(nephi1).toBeDefined();
  expect(nephi1.first_verse_id).toBe(31103);
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:jest -- --testPathPattern="canon-structure" -v`
Expected: FAIL

**Step 3: Create LDS structure YAML**

```yaml
# data/canons/lds/_structure.yml
canon: lds
name: "LDS Restoration Scripture"
description: "Book of Mormon, Doctrine and Covenants, Pearl of Great Price"

extends: bible
id_format: integer
id_start: 31103
id_end: 41995

books:
  - key: 1_nephi
    order: 67
    chapters: 22
    verses: [20, 24, 31, 38, 22, 6, 22, 40, 42, 19, 36, 23, 42, 30, 36, 39, 55, 25, 24, 22, 26, 31]
    first_verse_id: 31103

  - key: 2_nephi
    order: 68
    chapters: 33
    first_verse_id: 31728

  # ... (remaining LDS books - generate from scriptdata.mjs)

  - key: articles_of_faith
    order: 87
    chapters: 1
    verses: [13]
    first_verse_id: 41983
```

**Step 4: Add loadCanonWithInheritance to canon-loader**

Add to `src/lib/canon-loader.mjs`:

```javascript
import { deepMerge } from './deep-merge.mjs';

// Cache for loaded canons
const canonCache = new Map();

/**
 * Load canon with inheritance resolution
 * @param {string} canonName - Canon name
 * @returns {Object|null} Merged canon structure
 */
export function loadCanonWithInheritance(canonName) {
  if (canonCache.has(canonName)) {
    return canonCache.get(canonName);
  }

  const structure = loadCanonStructure(canonName);
  if (!structure) return null;

  let merged = { ...structure };

  // If extends parent, load and merge parent first
  if (structure.extends) {
    const parent = loadCanonWithInheritance(structure.extends);
    if (parent) {
      merged = {
        ...structure,
        books: [...parent.books, ...structure.books],
        _parent: structure.extends
      };
    }
  }

  canonCache.set(canonName, merged);
  return merged;
}

/**
 * Clear canon cache (for testing)
 */
export function clearCanonCache() {
  canonCache.clear();
}
```

**Step 5: Run test to verify it passes**

Run: `npm run test:jest -- --testPathPattern="canon-structure" -v`
Expected: PASS (4 tests)

**Step 6: Commit**

```bash
git add data/canons/lds/_structure.yml src/lib/canon-loader.mjs test/unit/canon-structure.test.js
git commit -m "feat: add LDS canon structure with Bible inheritance"
```

---

## Phase 4: Canon Language Files

### Task 4.1: Create Bible English Book Names

**Files:**
- Create: `data/canons/bible/en.yml`
- Modify: `src/lib/canon-loader.mjs`
- Create: `test/unit/canon-language.test.js`

**Step 1: Write failing test**

```javascript
// test/unit/canon-language.test.js
import { loadCanonLanguage, loadFullLanguage } from '../../src/lib/canon-loader.mjs';

describe('Canon Language Loading', () => {
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
```

**Step 2: Run test to verify it fails**

Run: `npm run test:jest -- --testPathPattern="canon-language" -v`
Expected: FAIL

**Step 3: Create Bible English YAML (abbreviated)**

```yaml
# data/canons/bible/en.yml
canon: bible
language: en

books:
  genesis:
    name: "Genesis"
    abbreviations: ["gen", "gn"]
    alternates: ["1 moses", "first book of moses"]

  exodus:
    name: "Exodus"
    abbreviations: ["ex", "exod", "exo"]
    alternates: ["2 moses", "second book of moses"]

  leviticus:
    name: "Leviticus"
    abbreviations: ["lev", "lv"]

  # ... (all 66 books)

  revelation:
    name: "Revelation"
    abbreviations: ["rev", "re", "apoc"]
    alternates: ["revelations", "apocalypse", "revelation of john"]
```

**Step 4: Add language loading functions**

Add to `src/lib/canon-loader.mjs`:

```javascript
/**
 * Load canon-specific language file
 * @param {string} canonName - Canon name
 * @param {string} langCode - Language code
 * @returns {Object|null} Canon language config or null
 */
export function loadCanonLanguage(canonName, langCode) {
  const path = join(DATA_DIR, 'canons', canonName, `${langCode}.yml`);
  return loadYaml(path);
}

/**
 * Load full language config (shared + canon + parent canon)
 * @param {string} canonName - Canon name
 * @param {string} langCode - Language code
 * @returns {Object|null} Merged language config
 */
export function loadFullLanguage(canonName, langCode) {
  const shared = loadSharedLanguage(langCode);
  if (!shared) return null;

  const structure = loadCanonStructure(canonName);
  if (!structure) return null;

  // Load parent's language if extends
  let parentLang = {};
  if (structure.extends) {
    parentLang = loadCanonLanguage(structure.extends, langCode) || {};
  }

  const canonLang = loadCanonLanguage(canonName, langCode) || {};

  // Merge: shared → parent → canon
  return deepMerge(shared, parentLang, canonLang);
}
```

**Step 5: Run test to verify it passes**

Run: `npm run test:jest -- --testPathPattern="canon-language" -v`
Expected: PASS (2 tests)

**Step 6: Commit**

```bash
git add data/canons/bible/en.yml src/lib/canon-loader.mjs test/unit/canon-language.test.js
git commit -m "feat: add Bible English book names in YAML"
```

---

### Task 4.2: Create LDS English Book Names

**Files:**
- Create: `data/canons/lds/en.yml`
- Modify: `test/unit/canon-language.test.js`

**Step 1: Add failing test**

Add to `test/unit/canon-language.test.js`:

```javascript
test('loads LDS English with Bible books via inheritance', () => {
  const full = loadFullLanguage('lds', 'en');

  // From Bible (via inheritance)
  expect(full.books.genesis.name).toBe('Genesis');

  // From LDS
  expect(full.books['1_nephi']).toBeDefined();
  expect(full.books['1_nephi'].name).toBe('1 Nephi');
  expect(full.books.doctrine_and_covenants).toBeDefined();
  expect(full.books.doctrine_and_covenants.chapter_label).toBe('section');
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:jest -- --testPathPattern="canon-language" -v`
Expected: FAIL

**Step 3: Create LDS English YAML**

```yaml
# data/canons/lds/en.yml
canon: lds
language: en

books:
  1_nephi:
    name: "1 Nephi"
    abbreviations: ["1 ne", "1ne", "1 nep"]
    alternates: ["first nephi", "I nephi"]

  2_nephi:
    name: "2 Nephi"
    abbreviations: ["2 ne", "2ne", "2 nep"]
    alternates: ["second nephi", "II nephi"]

  # ... (remaining LDS books)

  doctrine_and_covenants:
    name: "Doctrine and Covenants"
    abbreviations: ["d&c", "dc", "d and c"]
    chapter_label: "section"

  articles_of_faith:
    name: "Articles of Faith"
    abbreviations: ["a of f", "aof", "af"]

pre_rules:
  - pattern: "\\bgospel\\s+(?:of|according\\s+to)\\s+"
    replacement: ""
  - pattern: "\\bepistle\\s+(?:of|to(?:\\s+the)?)\\s+(?!jeremiah)"
    replacement: ""
```

**Step 4: Run test to verify it passes**

Run: `npm run test:jest -- --testPathPattern="canon-language" -v`
Expected: PASS (3 tests)

**Step 5: Commit**

```bash
git add data/canons/lds/en.yml test/unit/canon-language.test.js
git commit -m "feat: add LDS English book names in YAML"
```

---

## Phase 5: Options Resolution API

### Task 5.1: Create Options Resolver

**Files:**
- Create: `src/lib/options-resolver.mjs`
- Create: `test/unit/options-resolver.test.js`

**Step 1: Write failing test**

```javascript
// test/unit/options-resolver.test.js
import {
  resolveOptions,
  setDefaults,
  getDefaults,
  isKnownLanguage,
  isKnownCanon
} from '../../src/lib/options-resolver.mjs';

describe('Options Resolver', () => {
  beforeEach(() => {
    setDefaults({ language: 'en', canon: 'lds', fuzzyCanon: true });
  });

  test('undefined returns defaults', () => {
    const opts = resolveOptions(undefined);
    expect(opts.language).toBe('en');
    expect(opts.canon).toBe('lds');
    expect(opts.fuzzyCanon).toBe(true);
  });

  test('string recognized as language', () => {
    const opts = resolveOptions('ko');
    expect(opts.language).toBe('ko');
    expect(opts.canon).toBe('lds');
  });

  test('string recognized as canon when not a language', () => {
    const opts = resolveOptions('bible');
    expect(opts.language).toBe('en');
    expect(opts.canon).toBe('bible');
  });

  test('string recognized as canon - shakespeare', () => {
    const opts = resolveOptions('shakespeare');
    expect(opts.language).toBe('en');
    expect(opts.canon).toBe('shakespeare');
  });

  test('object merges with defaults', () => {
    const opts = resolveOptions({ canon: 'bible', fuzzyCanon: false });
    expect(opts.language).toBe('en');
    expect(opts.canon).toBe('bible');
    expect(opts.fuzzyCanon).toBe(false);
  });

  test('unknown string throws error', () => {
    expect(() => resolveOptions('xyz123')).toThrow('Unknown language or canon');
  });

  test('isKnownLanguage works', () => {
    expect(isKnownLanguage('en')).toBe(true);
    expect(isKnownLanguage('ko')).toBe(true);
    expect(isKnownLanguage('bible')).toBe(false);
  });

  test('isKnownCanon works', () => {
    expect(isKnownCanon('bible')).toBe(true);
    expect(isKnownCanon('lds')).toBe(true);
    expect(isKnownCanon('shakespeare')).toBe(true);
    expect(isKnownCanon('en')).toBe(false);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:jest -- --testPathPattern="options-resolver" -v`
Expected: FAIL

**Step 3: Write implementation**

```javascript
// src/lib/options-resolver.mjs

// Known languages (expandable via YAML discovery)
const KNOWN_LANGUAGES = new Set(['en', 'ko', 'de', 'es', 'fr', 'pt', 'ru', 'ja', 'zh', 'swe']);

// Known canons (expandable via YAML discovery)
const KNOWN_CANONS = new Set([
  'bible', 'lds', 'apocrypha', 'coc',
  'koran', 'gita', 'dhammapada', 'taoteching', 'vedas',
  'constitution', 'shakespeare'
]);

// Default settings
let defaults = {
  language: 'en',
  canon: 'lds',
  fuzzyCanon: true
};

/**
 * Set global defaults
 * @param {Object} newDefaults
 */
export function setDefaults(newDefaults) {
  defaults = { ...defaults, ...newDefaults };
}

/**
 * Get current defaults
 * @returns {Object}
 */
export function getDefaults() {
  return { ...defaults };
}

/**
 * Check if string is a known language code
 * @param {string} str
 * @returns {boolean}
 */
export function isKnownLanguage(str) {
  return KNOWN_LANGUAGES.has(str?.toLowerCase());
}

/**
 * Check if string is a known canon
 * @param {string} str
 * @returns {boolean}
 */
export function isKnownCanon(str) {
  return KNOWN_CANONS.has(str?.toLowerCase());
}

/**
 * Resolve options from various input formats
 * @param {undefined|string|Object} input
 * @returns {Object} Resolved options
 */
export function resolveOptions(input) {
  if (input === undefined || input === null) {
    return { ...defaults };
  }

  if (typeof input === 'string') {
    const lower = input.toLowerCase();

    // Check language first
    if (isKnownLanguage(lower)) {
      return { ...defaults, language: lower };
    }

    // Then check canon
    if (isKnownCanon(lower)) {
      return { ...defaults, canon: lower };
    }

    throw new Error(`Unknown language or canon: ${input}`);
  }

  if (typeof input === 'object') {
    return { ...defaults, ...input };
  }

  throw new Error(`Invalid options type: ${typeof input}`);
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test:jest -- --testPathPattern="options-resolver" -v`
Expected: PASS (8 tests)

**Step 5: Commit**

```bash
git add src/lib/options-resolver.mjs test/unit/options-resolver.test.js
git commit -m "feat: add options resolver with language/canon cascade"
```

---

## Phase 6: Integration Tests

### Task 6.1: Create Integration Test Suite

**Files:**
- Create: `test/integration/multi-canon.test.js`

**Step 1: Write integration tests**

```javascript
// test/integration/multi-canon.test.js
import {
  loadCanonWithInheritance,
  loadFullLanguage,
  clearCanonCache
} from '../../src/lib/canon-loader.mjs';
import { resolveOptions, setDefaults } from '../../src/lib/options-resolver.mjs';

describe('Multi-Canon Integration', () => {
  beforeEach(() => {
    clearCanonCache();
    setDefaults({ language: 'en', canon: 'lds', fuzzyCanon: true });
  });

  describe('Canon Inheritance', () => {
    test('LDS includes all Bible books', () => {
      const lds = loadCanonWithInheritance('lds');
      const bible = loadCanonWithInheritance('bible');

      // LDS should have more books than Bible alone
      expect(lds.books.length).toBeGreaterThan(bible.books.length);

      // All Bible books should be in LDS
      for (const book of bible.books) {
        const found = lds.books.find(b => b.key === book.key);
        expect(found).toBeDefined();
      }
    });

    test('LDS verse IDs continue after Bible', () => {
      const lds = loadCanonWithInheritance('lds');
      const bible = loadCanonWithInheritance('bible');

      expect(lds.id_start).toBe(bible.id_end + 1);
    });
  });

  describe('Language Merging', () => {
    test('LDS English includes shared patterns', () => {
      const full = loadFullLanguage('lds', 'en');

      // From shared/en.yml
      expect(full.numerals.roman.I).toBe(1);
      expect(full.delimiters.chapter_verse).toContain(':');

      // From canons/bible/en.yml (via inheritance)
      expect(full.books.genesis.name).toBe('Genesis');

      // From canons/lds/en.yml
      expect(full.books['1_nephi'].name).toBe('1 Nephi');
    });
  });

  describe('Options Resolution', () => {
    test('string cascades correctly', () => {
      expect(resolveOptions('ko').language).toBe('ko');
      expect(resolveOptions('bible').canon).toBe('bible');
      expect(resolveOptions('shakespeare').canon).toBe('shakespeare');
    });
  });
});
```

**Step 2: Run integration tests**

Run: `npm run test:jest -- --testPathPattern="multi-canon" -v`
Expected: PASS (5 tests)

**Step 3: Commit**

```bash
git add test/integration/multi-canon.test.js
git commit -m "test: add multi-canon integration tests"
```

---

## Phase 7: Migration Script

### Task 7.1: Create Data Migration Script

**Files:**
- Create: `scripts/migrate-to-yaml.mjs`

**Step 1: Create migration script**

```javascript
// scripts/migrate-to-yaml.mjs
/**
 * Migrate existing scriptdata.mjs to YAML structure
 * Run: node scripts/migrate-to-yaml.mjs
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';

// Import existing data
import scriptdata from '../data/scriptdata.mjs';
import scriptlang from '../data/scriptlang.mjs';

const DATA_DIR = 'data';

// Bible books (1-66)
const BIBLE_BOOKS = scriptdata.books.slice(0, 66);
// LDS books (67+)
const LDS_BOOKS = scriptdata.books.slice(66);

function ensureDir(path) {
  mkdirSync(path, { recursive: true });
}

function writeYaml(path, data) {
  const content = yaml.dump(data, {
    lineWidth: 120,
    noRefs: true,
    sortKeys: false
  });
  writeFileSync(path, content);
  console.log(`Wrote: ${path}`);
}

// Generate Bible structure
function generateBibleStructure() {
  const books = BIBLE_BOOKS.map((book, i) => ({
    key: book.key,
    order: i + 1,
    chapters: book.chapters.length,
    verses: book.chapters.map(c => c.verses),
    first_verse_id: book.first_verse_id
  }));

  return {
    canon: 'bible',
    name: 'Holy Bible (KJV)',
    description: 'King James Version - 66 books',
    id_format: 'integer',
    id_start: 1,
    id_end: 31102,
    books
  };
}

// Generate LDS structure
function generateLDSStructure() {
  const books = LDS_BOOKS.map((book, i) => ({
    key: book.key,
    order: 67 + i,
    chapters: book.chapters.length,
    verses: book.chapters.map(c => c.verses),
    first_verse_id: book.first_verse_id
  }));

  return {
    canon: 'lds',
    name: 'LDS Restoration Scripture',
    description: 'Book of Mormon, Doctrine and Covenants, Pearl of Great Price',
    extends: 'bible',
    id_format: 'integer',
    id_start: 31103,
    id_end: 41995,
    books
  };
}

// Main migration
function migrate() {
  console.log('Migrating scripture data to YAML...\n');

  // Create directories
  ensureDir(join(DATA_DIR, 'shared'));
  ensureDir(join(DATA_DIR, 'canons', 'bible'));
  ensureDir(join(DATA_DIR, 'canons', 'lds'));

  // Generate and write structures
  writeYaml(
    join(DATA_DIR, 'canons', 'bible', '_structure.yml'),
    generateBibleStructure()
  );

  writeYaml(
    join(DATA_DIR, 'canons', 'lds', '_structure.yml'),
    generateLDSStructure()
  );

  console.log('\nMigration complete!');
}

migrate();
```

**Step 2: Run migration**

Run: `node scripts/migrate-to-yaml.mjs`
Expected: Creates full YAML files from existing data

**Step 3: Verify generated files**

Run: `npm run test:jest -- --testPathPattern="canon-structure" -v`
Expected: PASS

**Step 4: Commit**

```bash
git add scripts/migrate-to-yaml.mjs data/canons/
git commit -m "feat: add migration script and generate full YAML structures"
```

---

## Summary

This plan covers the core infrastructure for multi-canon support:

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1 | 1.1-1.3 | YAML infrastructure (loader, merge) |
| 2 | 2.1-2.2 | Shared language files (en, ko) |
| 3 | 3.1-3.2 | Canon structures (bible, lds with extends) |
| 4 | 4.1-4.2 | Canon language files (book names) |
| 5 | 5.1 | Options resolver API |
| 6 | 6.1 | Integration tests |
| 7 | 7.1 | Migration script |

**Next phases (separate plan):**
- Phase 8: Wire new loaders into existing API
- Phase 9: Fuzzy canon matching
- Phase 10: Cross-canon mappings
- Phase 11: Build-time compilation
- Phase 12: Deprecation and cleanup
