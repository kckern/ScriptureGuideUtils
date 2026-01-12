# Test Framework Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement a comprehensive Jest-based test suite with YAML fixtures, tiered CI gates, and ~2,100+ test cases across 12 languages.

**Architecture:** Jest test runner with YAML fixture files per language. Tests organized by function (lookup/generate/detect) and tier (critical/edge-cases/known-issues). Fixture loader abstracts YAML parsing. Snapshots for prose regression testing.

**Tech Stack:** Jest, js-yaml, glob, Node.js ESM

---

## Phase 1: Foundation

### Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install Jest and testing dependencies**

Run:
```bash
npm install --save-dev jest js-yaml glob
```

**Step 2: Verify installation**

Run: `cat package.json | grep -A5 devDependencies`
Expected: jest, js-yaml, glob listed

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add Jest and testing dependencies"
```

---

### Task 2: Create Directory Structure

**Files:**
- Create directories for test organization

**Step 1: Create all test directories**

Run:
```bash
mkdir -p test/helpers
mkdir -p test/fixtures/detect-prose
mkdir -p test/lookup
mkdir -p test/generate
mkdir -p test/detect
mkdir -p test/roundtrip
mkdir -p test/language
mkdir -p test/prose-samples/en
mkdir -p test/prose-samples/ko
mkdir -p scripts/generation-prompts
```

**Step 2: Move existing prose samples**

Run:
```bash
cp test/vvtest-en.txt test/prose-samples/en/
cp test/testDetect.en.txt test/prose-samples/en/
cp test/vvtest-ko.txt test/prose-samples/ko/
```

**Step 3: Create .gitkeep files for empty directories**

Run:
```bash
touch test/fixtures/detect-prose/.gitkeep
touch scripts/generation-prompts/.gitkeep
```

**Step 4: Commit**

```bash
git add test/ scripts/
git commit -m "chore: create test directory structure"
```

---

### Task 3: Configure Jest

**Files:**
- Create: `jest.config.js`
- Modify: `package.json`

**Step 1: Create Jest configuration**

Create `jest.config.js`:
```javascript
export default {
  testEnvironment: 'node',
  transform: {},
  moduleFileExtensions: ['js', 'mjs'],
  testMatch: [
    '**/test/**/*.test.js',
    '**/test/**/*.test.mjs'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.mjs',
    '!src/**/*.test.mjs'
  ],
  setupFilesAfterEnv: ['./test/setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/test/_archive/'],
  verbose: true
};
```

**Step 2: Create test setup file**

Create `test/setup.js`:
```javascript
// Global test setup
// Reset any global state before each test file

beforeEach(() => {
  // Clear any cached language settings between tests
});
```

**Step 3: Add npm scripts to package.json**

Add to `package.json` scripts section:
```json
{
  "scripts": {
    "test:jest": "node --experimental-vm-modules node_modules/jest/bin/jest.js",
    "test:critical": "node --experimental-vm-modules node_modules/jest/bin/jest.js --testPathPattern='critical\\.test\\.js$'",
    "test:edge": "node --experimental-vm-modules node_modules/jest/bin/jest.js --testPathPattern='edge-cases\\.test\\.js$'",
    "test:known-issues": "node --experimental-vm-modules node_modules/jest/bin/jest.js --testPathPattern='known-issues\\.test\\.js$'",
    "test:coverage": "node --experimental-vm-modules node_modules/jest/bin/jest.js --coverage"
  }
}
```

**Step 4: Run Jest to verify configuration**

Run: `npm run test:jest -- --version`
Expected: Jest version number displayed

**Step 5: Commit**

```bash
git add jest.config.js test/setup.js package.json
git commit -m "chore: configure Jest test runner"
```

---

### Task 4: Implement Fixture Loader

**Files:**
- Create: `test/helpers/fixture-loader.js`

**Step 1: Create the fixture loader module**

Create `test/helpers/fixture-loader.js`:
```javascript
import { readFileSync } from 'fs';
import { parse } from 'yaml';
import { glob } from 'glob';

/**
 * Load all fixture files or filter by language
 * @param {string|null} language - Language code (e.g., 'en', 'ko') or null for all
 * @returns {Array} Array of parsed fixture objects
 */
export function loadFixtures(language = null) {
  const pattern = language
    ? `test/fixtures/${language}.yml`
    : 'test/fixtures/*.yml';

  const files = glob.sync(pattern);

  if (files.length === 0) {
    console.warn(`No fixtures found for pattern: ${pattern}`);
    return [];
  }

  return files.map(file => {
    const content = readFileSync(file, 'utf8');
    return parse(content);
  });
}

/**
 * Extract test cases for a specific function and tier
 * @param {Array} fixtures - Array of fixture objects from loadFixtures
 * @param {string} fn - Function name: 'lookup', 'generate', 'detect'
 * @param {string} tier - Tier name: 'critical', 'edge_cases', 'invalid', 'known_issues'
 * @returns {Array} Flat array of test cases with language attached
 */
export function getTestCases(fixtures, fn, tier) {
  return fixtures.flatMap(f =>
    (f[fn]?.[tier] || []).map(tc => ({ ...tc, language: f.language }))
  );
}

/**
 * Load prose detection fixtures
 * @param {string|null} language - Language code or null for all
 * @returns {Object|Array} Single fixture object if language specified, array otherwise
 */
export function loadProseFixtures(language = null) {
  const pattern = language
    ? `test/fixtures/detect-prose/${language}.yml`
    : 'test/fixtures/detect-prose/*.yml';

  const files = glob.sync(pattern);

  if (files.length === 0) {
    throw new Error(`No prose fixtures found for pattern: ${pattern}`);
  }

  const fixtures = files.map(file => {
    const content = readFileSync(file, 'utf8');
    return parse(content);
  });

  return language ? fixtures[0] : fixtures;
}

/**
 * Load a prose sample file for snapshot testing
 * @param {string} language - Language code
 * @param {string} filename - Filename within the language folder
 * @returns {string} File contents
 */
export function loadProseSample(language, filename) {
  const path = `test/prose-samples/${language}/${filename}`;
  return readFileSync(path, 'utf8');
}
```

**Step 2: Create a simple test to verify fixture loader**

Create `test/helpers/fixture-loader.test.js`:
```javascript
import { loadFixtures, getTestCases, loadProseSample } from './fixture-loader.js';

describe('fixture-loader', () => {
  test('loadFixtures returns empty array when no fixtures exist', () => {
    const result = loadFixtures('nonexistent');
    expect(result).toEqual([]);
  });

  test('getTestCases returns empty array for missing function', () => {
    const fixtures = [{ language: 'en', lookup: { critical: [] } }];
    const result = getTestCases(fixtures, 'nonexistent', 'critical');
    expect(result).toEqual([]);
  });

  test('loadProseSample reads existing prose file', () => {
    const content = loadProseSample('en', 'vvtest-en.txt');
    expect(content).toContain('Alma');
  });
});
```

**Step 3: Run the test**

Run: `npm run test:jest -- test/helpers/fixture-loader.test.js`
Expected: All 3 tests pass

**Step 4: Commit**

```bash
git add test/helpers/
git commit -m "feat: implement fixture loader for YAML test cases"
```

---

## Phase 2: English Fixtures (Seed)

### Task 5: Create Initial English Fixture File

**Files:**
- Create: `test/fixtures/en.yml`

**Step 1: Create English fixture with seed test cases**

Create `test/fixtures/en.yml`:
```yaml
language: en
meta:
  generated: "2025-01-12"
  version: "1.0.0"

lookup:
  critical:
    - id: en-lookup-001
      input: "John 3:16"
      expected_ids: [26137]
      expected_ref: "John 3:16"
      description: Simple single verse

    - id: en-lookup-002
      input: "Jn 3:16"
      expected_ids: [26137]
      expected_ref: "John 3:16"
      description: Common abbreviation

    - id: en-lookup-003
      input: "Genesis 1:1"
      expected_ids: [1]
      expected_ref: "Genesis 1:1"
      description: First verse in Bible

    - id: en-lookup-004
      input: "Gen 1:1-3"
      expected_ids: [1, 2, 3]
      expected_ref: "Genesis 1:1-3"
      description: Verse range

    - id: en-lookup-005
      input: "Exodus 20:1-10"
      expected_ids: [2057, 2058, 2059, 2060, 2061, 2062, 2063, 2064, 2065, 2066]
      expected_ref: "Exodus 20:1-10"
      description: Ten Commandments opening

  edge_cases:
    - id: en-lookup-edge-001
      input: "Jn  3:16"
      expected_ids: [26137]
      expected_ref: "John 3:16"
      tags: [whitespace, double-space]
      description: Double space between book and chapter

    - id: en-lookup-edge-002
      input: "Jn 3.16"
      expected_ids: [26137]
      expected_ref: "John 3:16"
      tags: [delimiter, period]
      description: Period instead of colon

    - id: en-lookup-edge-003
      input: "1 Jn 1:1"
      expected_ids: [30580]
      expected_ref: "1 John 1:1"
      tags: [numbered-book]
      description: Numbered book with abbreviation

  invalid:
    - id: en-lookup-invalid-001
      input: "Nosuchbook 1:1"
      expected_ids: []
      description: Non-existent book

    - id: en-lookup-invalid-002
      input: ""
      expected_ids: []
      description: Empty string

    - id: en-lookup-invalid-003
      input: "John 999:999"
      expected_ids: []
      description: Invalid chapter and verse

  known_issues: []

generate:
  critical:
    - id: en-gen-001
      input_ids: [26137]
      expected: "John 3:16"
      description: Single verse

    - id: en-gen-002
      input_ids: [26137, 26138, 26139]
      expected: "John 3:16-18"
      description: Consecutive verses collapse to range

    - id: en-gen-003
      input_ids: [26137, 26139]
      expected: "John 3:16, 18"
      description: Non-consecutive verses use comma

    - id: en-gen-004
      input_ids: [1, 2, 3]
      expected: "Genesis 1:1-3"
      description: First verses of Bible

    - id: en-gen-005
      input_ids: []
      expected: ""
      description: Empty array returns empty string

  edge_cases:
    - id: en-gen-edge-001
      input_ids: [26137, 26138, 26140]
      expected: "John 3:16-17, 19"
      tags: [mixed-range]
      description: Mixed consecutive and non-consecutive

detect:
  critical:
    - id: en-detect-001
      input: "Read John 3:16 for comfort."
      expected_refs: ["John 3:16"]
      expected_ids: [[26137]]
      context_variations:
        contextAware_true:
          expected_output: "Read [John 3:16] for comfort."
        contextAware_false:
          expected_output: "Read [John 3:16] for comfort."
      description: Simple inline reference

    - id: en-detect-002
      input: "See Genesis 1:1 and Exodus 20:1."
      expected_refs: ["Genesis 1:1", "Exodus 20:1"]
      context_variations:
        contextAware_true:
          expected_output: "See [Genesis 1:1] and [Exodus 20:1]."
        contextAware_false:
          expected_output: "See [Genesis 1:1] and [Exodus 20:1]."
      description: Multiple references in one sentence

  edge_cases:
    - id: en-detect-edge-001
      input: "cf. Jn 3.16; Mt 5.1"
      expected_refs: ["John 3:16", "Matthew 5:1"]
      tags: [abbreviation, period-delimiter]
      description: Abbreviated refs with period delimiters
```

**Step 2: Verify YAML syntax**

Run: `node -e "import('js-yaml').then(y => console.log(y.load(require('fs').readFileSync('test/fixtures/en.yml', 'utf8')).language))"`
Expected: `en`

**Step 3: Commit**

```bash
git add test/fixtures/en.yml
git commit -m "feat: add initial English test fixtures"
```

---

## Phase 3: Core Test Implementations

### Task 6: Implement Lookup Tests

**Files:**
- Create: `test/lookup/lookup.critical.test.js`
- Create: `test/lookup/lookup.edge-cases.test.js`
- Create: `test/lookup/lookup.known-issues.test.js`

**Step 1: Create critical lookup tests**

Create `test/lookup/lookup.critical.test.js`:
```javascript
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
```

**Step 2: Create edge-cases lookup tests**

Create `test/lookup/lookup.edge-cases.test.js`:
```javascript
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
```

**Step 3: Create known-issues lookup tests**

Create `test/lookup/lookup.known-issues.test.js`:
```javascript
import { lookupReference } from '../../dist/scriptures.mjs';
import { loadFixtures, getTestCases } from '../helpers/fixture-loader.js';

const fixtures = loadFixtures();
const knownIssues = getTestCases(fixtures, 'lookup', 'known_issues');

describe('lookupReference - Known Issues', () => {
  if (knownIssues.length === 0) {
    test.skip('No known issues currently tracked', () => {});
  } else {
    describe.each(knownIssues)('$id: $issue', (tc) => {
      test.failing(`should return ${JSON.stringify(tc.expected_ids)} (${tc.github_issue || 'no issue'})`, () => {
        const result = lookupReference(tc.input, tc.language);
        expect(result.verse_ids).toEqual(tc.expected_ids);
      });
    });
  }
});
```

**Step 4: Run lookup tests**

Run: `npm run test:jest -- test/lookup/`
Expected: All tests pass (critical and edge-cases should pass; known-issues skipped if empty)

**Step 5: Commit**

```bash
git add test/lookup/
git commit -m "feat: implement lookup reference tests"
```

---

### Task 7: Implement Generate Tests

**Files:**
- Create: `test/generate/generate.critical.test.js`
- Create: `test/generate/generate.edge-cases.test.js`

**Step 1: Create critical generate tests**

Create `test/generate/generate.critical.test.js`:
```javascript
import { generateReference } from '../../dist/scriptures.mjs';
import { loadFixtures, getTestCases } from '../helpers/fixture-loader.js';

const fixtures = loadFixtures();
const criticalCases = getTestCases(fixtures, 'generate', 'critical');

describe('generateReference - Critical', () => {
  describe.each(criticalCases)('$id: $description', (tc) => {
    test('generates expected reference string', () => {
      const result = generateReference(tc.input_ids, tc.language);
      expect(result).toBe(tc.expected);
    });
  });
});
```

**Step 2: Create edge-cases generate tests**

Create `test/generate/generate.edge-cases.test.js`:
```javascript
import { generateReference } from '../../dist/scriptures.mjs';
import { loadFixtures, getTestCases } from '../helpers/fixture-loader.js';

const fixtures = loadFixtures();
const edgeCases = getTestCases(fixtures, 'generate', 'edge_cases');

describe('generateReference - Edge Cases', () => {
  if (edgeCases.length === 0) {
    test.skip('No edge cases currently defined', () => {});
  } else {
    describe.each(edgeCases)('$id: $description [$tags]', (tc) => {
      test('generates expected reference string', () => {
        const result = generateReference(tc.input_ids, tc.language);
        expect(result).toBe(tc.expected);
      });
    });
  }
});
```

**Step 3: Run generate tests**

Run: `npm run test:jest -- test/generate/`
Expected: All tests pass

**Step 4: Commit**

```bash
git add test/generate/
git commit -m "feat: implement generate reference tests"
```

---

### Task 8: Implement Roundtrip Tests

**Files:**
- Create: `test/roundtrip/roundtrip.critical.test.js`
- Create: `test/roundtrip/cross-language.test.js`

**Step 1: Create critical roundtrip tests**

Create `test/roundtrip/roundtrip.critical.test.js`:
```javascript
import { lookupReference, generateReference } from '../../dist/scriptures.mjs';
import { loadFixtures, getTestCases } from '../helpers/fixture-loader.js';

const fixtures = loadFixtures();
const lookupCases = getTestCases(fixtures, 'lookup', 'critical');

describe('Round-trip Verification - Critical', () => {
  describe.each(lookupCases)('$id: $input', (tc) => {
    test('lookup → generate → lookup returns same IDs', () => {
      // Forward: input → verse IDs
      const forward = lookupReference(tc.input, tc.language);
      expect(forward.verse_ids.length).toBeGreaterThan(0);

      // Generate: verse IDs → canonical reference
      const canonical = generateReference(forward.verse_ids, tc.language);
      expect(canonical).toBeTruthy();

      // Backward: canonical → verse IDs (must match)
      const backward = lookupReference(canonical, tc.language);
      expect(backward.verse_ids).toEqual(forward.verse_ids);
    });

    test('generate produces canonical form', () => {
      const forward = lookupReference(tc.input, tc.language);
      const canonical = generateReference(forward.verse_ids, tc.language);
      expect(canonical).toBe(tc.expected_ref);
    });
  });
});
```

**Step 2: Create cross-language tests**

Create `test/roundtrip/cross-language.test.js`:
```javascript
import { lookupReference, generateReference } from '../../dist/scriptures.mjs';

describe('Cross-Language Round-trip', () => {
  const johnThreeSixteen = 26137;
  const languages = ['en']; // Expand as more fixtures are added

  test.each(languages)('%s: verse ID → generate → lookup consistency', (lang) => {
    const ref = generateReference([johnThreeSixteen], lang);
    expect(ref).toBeTruthy();

    const result = lookupReference(ref, lang);
    expect(result.verse_ids).toEqual([johnThreeSixteen]);
  });

  test('verse IDs are language-independent', () => {
    // Same verse ID should work across languages
    const enRef = generateReference([johnThreeSixteen], 'en');
    const enResult = lookupReference(enRef, 'en');
    expect(enResult.verse_ids).toEqual([johnThreeSixteen]);
  });
});
```

**Step 3: Run roundtrip tests**

Run: `npm run test:jest -- test/roundtrip/`
Expected: All tests pass

**Step 4: Commit**

```bash
git add test/roundtrip/
git commit -m "feat: implement roundtrip verification tests"
```

---

### Task 9: Implement Detect Tests

**Files:**
- Create: `test/detect/detect.critical.test.js`
- Create: `test/detect/detect.edge-cases.test.js`

**Step 1: Create critical detect tests**

Create `test/detect/detect.critical.test.js`:
```javascript
import { detectReferences, generateReference } from '../../dist/scriptures.mjs';
import { loadFixtures, getTestCases } from '../helpers/fixture-loader.js';

const fixtures = loadFixtures();
const criticalCases = getTestCases(fixtures, 'detect', 'critical');

describe('detectReferences - Critical', () => {
  describe.each(criticalCases)('$id: $description', (tc) => {
    test('contextAware: true', () => {
      const variation = tc.context_variations?.contextAware_true;
      if (!variation) {
        return; // Skip if no variation defined
      }

      const result = detectReferences(
        tc.input,
        (text, ids) => `[${generateReference(ids, tc.language)}]`,
        { language: tc.language, contextAware: true }
      );
      expect(result).toBe(variation.expected_output);
    });

    test('contextAware: false', () => {
      const variation = tc.context_variations?.contextAware_false;
      if (!variation) {
        return; // Skip if no variation defined
      }

      const result = detectReferences(
        tc.input,
        (text, ids) => `[${generateReference(ids, tc.language)}]`,
        { language: tc.language, contextAware: false }
      );
      expect(result).toBe(variation.expected_output);
    });
  });
});
```

**Step 2: Create edge-cases detect tests**

Create `test/detect/detect.edge-cases.test.js`:
```javascript
import { detectReferences, generateReference } from '../../dist/scriptures.mjs';
import { loadFixtures, getTestCases } from '../helpers/fixture-loader.js';

const fixtures = loadFixtures();
const edgeCases = getTestCases(fixtures, 'detect', 'edge_cases');

describe('detectReferences - Edge Cases', () => {
  if (edgeCases.length === 0) {
    test.skip('No edge cases currently defined', () => {});
  } else {
    describe.each(edgeCases)('$id: $description [$tags]', (tc) => {
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
    });
  }
});
```

**Step 3: Run detect tests**

Run: `npm run test:jest -- test/detect/`
Expected: All tests pass

**Step 4: Commit**

```bash
git add test/detect/
git commit -m "feat: implement detect reference tests"
```

---

### Task 10: Implement Snapshot Tests

**Files:**
- Create: `test/detect/detect-snapshots.test.js`

**Step 1: Create snapshot tests for prose samples**

Create `test/detect/detect-snapshots.test.js`:
```javascript
import { detectReferences, generateReference } from '../../dist/scriptures.mjs';
import { loadProseSample } from '../helpers/fixture-loader.js';

describe('detectReferences - Snapshot Regression', () => {
  describe('English prose samples', () => {
    test('vvtest-en.txt with contextAware: true', () => {
      const content = loadProseSample('en', 'vvtest-en.txt');
      const result = detectReferences(
        content,
        (originalText, verseIds) => {
          const canonical = generateReference(verseIds, 'en');
          return `[${originalText}|${canonical}]`;
        },
        { language: 'en', contextAware: true }
      );

      expect(result).toMatchSnapshot();
    });

    test('vvtest-en.txt with contextAware: false', () => {
      const content = loadProseSample('en', 'vvtest-en.txt');
      const result = detectReferences(
        content,
        (originalText, verseIds) => {
          const canonical = generateReference(verseIds, 'en');
          return `[${originalText}|${canonical}]`;
        },
        { language: 'en', contextAware: false }
      );

      expect(result).toMatchSnapshot();
    });

    test('testDetect.en.txt with contextAware: true', () => {
      const content = loadProseSample('en', 'testDetect.en.txt');
      const result = detectReferences(
        content,
        (originalText, verseIds) => {
          const canonical = generateReference(verseIds, 'en');
          return `[${originalText}|${canonical}]`;
        },
        { language: 'en', contextAware: true }
      );

      expect(result).toMatchSnapshot();
    });
  });

  describe('Korean prose samples', () => {
    test('vvtest-ko.txt with contextAware: true', () => {
      const content = loadProseSample('ko', 'vvtest-ko.txt');
      const result = detectReferences(
        content,
        (originalText, verseIds) => {
          const canonical = generateReference(verseIds, 'ko');
          return `[${originalText}|${canonical}]`;
        },
        { language: 'ko', contextAware: true }
      );

      expect(result).toMatchSnapshot();
    });
  });
});
```

**Step 2: Run snapshot tests to generate initial snapshots**

Run: `npm run test:jest -- test/detect/detect-snapshots.test.js --updateSnapshot`
Expected: Snapshots created in `test/detect/__snapshots__/`

**Step 3: Run snapshot tests to verify they pass**

Run: `npm run test:jest -- test/detect/detect-snapshots.test.js`
Expected: All tests pass

**Step 4: Commit**

```bash
git add test/detect/detect-snapshots.test.js test/detect/__snapshots__/
git commit -m "feat: implement snapshot tests for prose detection"
```

---

## Phase 4: CI Integration

### Task 11: Add GitHub Actions Workflow

**Files:**
- Create: `.github/workflows/test.yml`

**Step 1: Create GitHub Actions workflow**

Run: `mkdir -p .github/workflows`

Create `.github/workflows/test.yml`:
```yaml
name: Test Suite

on:
  pull_request:
    branches: [master, main]
  push:
    branches: [master, main]

jobs:
  critical:
    name: Critical Tests (Merge Gate)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run build

      - name: Run Critical Tests
        run: npm run test:critical -- --ci

  edge-cases:
    name: Edge Case Tests (Release Gate)
    runs-on: ubuntu-latest
    needs: critical
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run build

      - name: Run Edge Case Tests
        run: npm run test:edge -- --ci

  known-issues:
    name: Known Issues (Report Only)
    runs-on: ubuntu-latest
    needs: critical
    continue-on-error: true
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run build

      - name: Run Known Issue Tests
        run: npm run test:known-issues -- --ci
```

**Step 2: Commit**

```bash
git add .github/
git commit -m "ci: add GitHub Actions test workflow"
```

---

### Task 12: Final Verification

**Step 1: Run full test suite**

Run: `npm run test:jest`
Expected: All tests pass

**Step 2: Run critical tests only**

Run: `npm run test:critical`
Expected: Critical tests pass

**Step 3: Run with coverage**

Run: `npm run test:coverage`
Expected: Coverage report generated

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete test framework implementation"
```

---

## Summary

| Phase | Tasks | Key Files |
|-------|-------|-----------|
| Foundation | 1-4 | `jest.config.js`, `test/helpers/fixture-loader.js` |
| Fixtures | 5 | `test/fixtures/en.yml` |
| Core Tests | 6-10 | `test/lookup/`, `test/generate/`, `test/detect/`, `test/roundtrip/` |
| CI | 11-12 | `.github/workflows/test.yml` |

**Next Steps After Implementation:**
1. Generate fixtures for remaining 11 languages
2. Add prose detection fixtures (`test/fixtures/detect-prose/en.yml`)
3. Expand test cases via AI generation
4. Run validation script to verify fixture accuracy
