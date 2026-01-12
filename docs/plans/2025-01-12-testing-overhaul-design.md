# Testing Overhaul Design

**Date:** 2025-01-12
**Status:** Draft
**Author:** Brainstorming session

## Overview

A comprehensive, tiered test suite for the scripture-guide library providing:

1. **High confidence releases** — Critical tests gate merges, edge cases gate publishes
2. **Safe language expansion** — Each language isolated in its own fixture file, full matrix CI
3. **Robust edge case coverage** — Whitespace, diacritics, delimiters systematically tested
4. **Living documentation** — Known issues tracked as `test.failing()`, automatically alert when fixed

## Goals

- **Confidence before release** — Catch regressions before npm publish with automated CI/CD gates
- **Language expansion safety** — Ensure adding new languages doesn't break existing ones
- **Edge case discovery** — Find and document Unicode/diacritics/spacing issues that cause bugs

## Architecture

### Directory Structure

```
test/
├── jest.config.js
├── setup.js
├── helpers/
│   └── fixture-loader.js       # YAML parsing, test case extraction
├── fixtures/                   # AI-generated, human-validated
│   ├── en.yml                  # ~130 cases per language
│   ├── ko.yml
│   ├── ... (12 languages)
│   └── detect-prose/           # Prose paragraph fixtures
│       ├── en.yml
│       ├── ko.yml
│       └── ...
├── lookup/
│   ├── lookup.critical.test.js
│   ├── lookup.edge-cases.test.js
│   └── lookup.known-issues.test.js
├── generate/
│   └── ... (same pattern)
├── detect/
│   ├── detect.critical.test.js
│   ├── detect.edge-cases.test.js
│   ├── detect.known-issues.test.js
│   ├── detect-prose.critical.test.js   # Paragraph-level tests
│   ├── detect-prose.edge-cases.test.js
│   └── detect-snapshots.test.js        # Full-file regression
├── roundtrip/
│   ├── roundtrip.critical.test.js
│   ├── roundtrip.edge-cases.test.js
│   └── cross-language.test.js
├── language/
│   ├── fallback.test.js
│   └── explicit.test.js
└── prose-samples/              # Real-world text files for snapshots
    ├── en/
    │   ├── vvtest-en.txt
    │   ├── testDetect.en.txt
    │   └── commentary-sample.txt
    └── ko/
        └── vvtest-ko.txt

scripts/
├── generate-fixtures.mjs       # Prompt builder for LLM generation
├── validate-fixtures.mjs       # Post-generation integrity check
└── generation-prompts/         # Stored prompts for reproducibility
```

### Tier Naming Convention

- `*.critical.test.js` — Blocks PR merge
- `*.edge-cases.test.js` — Blocks npm publish
- `*.known-issues.test.js` — Reports only, uses `test.failing()`

## Test Categories

| Function | What It Tests |
|----------|---------------|
| **lookup** | Input variants → correct verse IDs |
| **generate** | Verse IDs → canonical reference string |
| **detect** | Find references in prose, context-aware modes |
| **roundtrip** | lookup→generate→lookup returns same IDs |
| **language** | Explicit vs fallback language resolution |

## Fixture Format (YAML)

Each language gets a dedicated YAML file with test cases organized by function and tier:

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

  edge_cases:
    - id: en-lookup-edge-001
      input: "Jn  3:16"  # note: double space
      expected_ids: [26137]
      tags: [whitespace, double-space]
      description: Double space between book and chapter

    - id: en-lookup-edge-002
      input: "Jn 3.16"
      expected_ids: [26137]
      tags: [delimiter, period]
      description: Period instead of colon

  invalid:
    - id: en-lookup-invalid-001
      input: "Nosuchbook 1:1"
      expected_ids: []
      description: Non-existent book

  known_issues:
    - id: en-lookup-issue-001
      input: "Song of Songs 1:1"
      expected_ids: [17549]
      actual_ids: []
      issue: Alternate name not recognized
      github_issue: "#123"

generate:
  critical:
    - id: en-gen-001
      input_ids: [26137]
      expected: "John 3:16"

    - id: en-gen-002
      input_ids: [26137, 26138, 26139]
      expected: "John 3:16-18"
      description: Consecutive verses collapse to range

    - id: en-gen-003
      input_ids: [26137, 26139]
      expected: "John 3:16, 18"
      description: Non-consecutive verses use comma

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

    - id: en-detect-002
      input: "See John 3:16 and v. 17 for context."
      expected_refs: ["John 3:16", "John 3:17"]
      context_variations:
        contextAware_true:
          expected_output: "See [John 3:16] and [John 3:17] for context."
          description: v. 17 resolves via context
        contextAware_false:
          expected_refs: ["John 3:16"]
          expected_output: "See [John 3:16] and v. 17 for context."
          description: v. 17 not detected without context

  edge_cases:
    - id: en-detect-edge-001
      input: "Compare Isa 45.22;Morm 3.18;Moro 10.24 carefully."
      tags: [delimiter, no-spaces, semicolon-packed]
      expected_refs: ["Isaiah 45:22", "Mormon 3:18", "Moroni 10:24"]
      description: No spaces around semicolons, periods as delimiters
```

## Test Runner Implementation

### Fixture Loader

```javascript
// test/helpers/fixture-loader.js
import { readFileSync } from 'fs';
import { parse } from 'yaml';
import { glob } from 'glob';

export function loadFixtures(language = null) {
  const pattern = language
    ? `test/fixtures/${language}.yml`
    : 'test/fixtures/*.yml';

  const files = glob.sync(pattern);
  return files.map(file => {
    const content = readFileSync(file, 'utf8');
    return parse(content);
  });
}

export function getTestCases(fixtures, fn, tier) {
  return fixtures.flatMap(f =>
    (f[fn]?.[tier] || []).map(tc => ({ ...tc, language: f.language }))
  );
}
```

### Lookup Tests

```javascript
// test/lookup/lookup.critical.test.js
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

  describe.each(invalidCases)('$id: $description', (tc) => {
    test('returns empty for invalid input', () => {
      const result = lookupReference(tc.input, tc.language);
      expect(result.verse_ids).toEqual([]);
      expect(result.ref).toBe('');
    });
  });
});
```

### Known Issues Tests

```javascript
// test/lookup/lookup.known-issues.test.js
import { lookupReference } from '../../dist/scriptures.mjs';
import { loadFixtures, getTestCases } from '../helpers/fixture-loader.js';

const fixtures = loadFixtures();
const knownIssues = getTestCases(fixtures, 'lookup', 'known_issues');

describe('lookupReference - Known Issues', () => {
  describe.each(knownIssues)('$id: $issue', (tc) => {
    test.failing(`should return ${tc.expected_ids} (${tc.github_issue})`, () => {
      const result = lookupReference(tc.input, tc.language);
      expect(result.verse_ids).toEqual(tc.expected_ids);
    });
  });
});
```

### Detect Tests

```javascript
// test/detect/detect.critical.test.js
import { detectReferences, generateReference } from '../../dist/scriptures.mjs';
import { loadFixtures, getTestCases } from '../helpers/fixture-loader.js';

const fixtures = loadFixtures();
const criticalCases = getTestCases(fixtures, 'detect', 'critical');

describe('detectReferences - Critical', () => {
  describe.each(criticalCases)('$id: $description', (tc) => {

    test('contextAware: true', () => {
      const variation = tc.context_variations.contextAware_true;
      const result = detectReferences(
        tc.input,
        (text, ids) => `[${generateReference(ids, tc.language)}]`,
        { language: tc.language, contextAware: true }
      );
      expect(result).toBe(variation.expected_output);
    });

    test('contextAware: false', () => {
      const variation = tc.context_variations.contextAware_false;
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

### Round-Trip Tests

```javascript
// test/roundtrip/roundtrip.critical.test.js
import { lookupReference, generateReference } from '../../dist/scriptures.mjs';
import { loadFixtures, getTestCases } from '../helpers/fixture-loader.js';

const fixtures = loadFixtures();
const lookupCases = getTestCases(fixtures, 'lookup', 'critical');

describe('Round-trip Verification - Critical', () => {
  describe.each(lookupCases)('$id: $input', (tc) => {

    test('lookup → generate → lookup returns same IDs', () => {
      const forward = lookupReference(tc.input, tc.language);
      expect(forward.verse_ids.length).toBeGreaterThan(0);

      const canonical = generateReference(forward.verse_ids, tc.language);
      expect(canonical).toBeTruthy();

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

### Cross-Language Tests

```javascript
// test/roundtrip/cross-language.test.js
import { lookupReference, generateReference } from '../../dist/scriptures.mjs';
import { loadFixtures } from '../helpers/fixture-loader.js';

const fixtures = loadFixtures();
const languages = fixtures.map(f => f.language);

describe('Cross-Language Round-trip', () => {
  const johnThreeSixteen = 26137;

  test.each(languages)('verse ID %s → generate → lookup consistency', (lang) => {
    const ref = generateReference([johnThreeSixteen], lang);
    expect(ref).toBeTruthy();

    const result = lookupReference(ref, lang);
    expect(result.verse_ids).toEqual([johnThreeSixteen]);
  });

  test('English input with Korean fallback resolves correctly', () => {
    const result = lookupReference('John 3:16', 'ko');
    expect(result.verse_ids).toEqual([26137]);
    expect(result.ref).not.toBe('John 3:16');
  });
});
```

## Prose Detection Testing

The `detectReferences` function requires special testing because it operates on real-world prose with:
- Context-dependent verse abbreviations (`vv. 18-21` resolving to earlier book)
- Packed references without spaces (`Isa 45.22;Morm 3.18;Moro 10.24for`)
- False positives to avoid (`Narration.js:761`, times like `3:16 PM`)
- HTML/markup interleaved with text
- Chapter anchors followed by verse-only references

### Prose Fixture Format

```yaml
# test/fixtures/detect-prose/en.yml
language: en
meta:
  generated: "2025-01-12"
  source: "Real-world commentary samples"

paragraphs:
  critical:
    - id: en-prose-001
      description: Context-dependent verse abbreviations
      input: |
        He sought for, obtained, and heeded the word of the Lord given through
        the living prophet (see Alma 43:23–26).
        He was vitally concerned for the welfare of those who served under his
        command (see vv. 18–21, 48:7–10, 49:18–20, 50:1–4).
      expected_refs:
        - ref: "Alma 43:23-26"
          ids: [12345, 12346, 12347, 12348]
        - ref: "Alma 43:18-21"
          ids: [12340, 12341, 12342, 12343]
          context_required: true  # only detected with contextAware: true
        - ref: "Alma 48:7-10"
          ids: [12400, 12401, 12402, 12403]
        - ref: "Alma 49:18-20"
          ids: [12450, 12451, 12452]
        - ref: "Alma 50:1-4"
          ids: [12500, 12501, 12502, 12503]
      context_variations:
        contextAware_true:
          ref_count: 5
          description: "vv. 18-21 resolves to Alma via context"
        contextAware_false:
          ref_count: 4
          description: "vv. 18-21 not detected without context"

    - id: en-prose-002
      description: Chapter with subsequent verse references
      input: |
        While it is often called "the vision," Doctrine and Covenants 76 is a series
        of visions combined into one grand revelation: a vision of the glory of the
        Son (vv. 20–24); a vision of the fall of Satan (vv. 25–49); a vision of those
        who inherit the celestial glory (vv. 50–70).
      expected_refs:
        - ref: "Doctrine and Covenants 76"
          type: chapter_anchor
        - ref: "Doctrine and Covenants 76:20-24"
          context_required: true
        - ref: "Doctrine and Covenants 76:25-49"
          context_required: true
        - ref: "Doctrine and Covenants 76:50-70"
          context_required: true

  edge_cases:
    - id: en-prose-edge-001
      description: Packed refs without spaces, period delimiters
      input: "see also Isa 45.22;Morm 3.18;Moro 10.24for prophets"
      expected_refs:
        - ref: "Isaiah 45:22"
        - ref: "Mormon 3:18"
        - ref: "Moroni 10:24"
      tags: [no-spaces, semicolon-packed, period-delimiter]

    - id: en-prose-edge-002
      description: HTML mixed with references
      input: |
        <i>loved the world</i> (Jn 3.16) and <i>draw all men unto him</i>
        (Jn 12.32; see 3 Ne 27.14n).
      expected_refs:
        - ref: "John 3:16"
        - ref: "John 12:32"
        - ref: "3 Nephi 27:14"
      tags: [html-entities, parenthetical, note-suffix]

    - id: en-prose-edge-003
      description: Cross-reference chains
      input: "Isa 11.11; cited at 2 Ne 21.11; 29.1"
      expected_refs:
        - ref: "Isaiah 11:11"
        - ref: "2 Nephi 21:11"
        - ref: "2 Nephi 29:1"
          context_required: true
      tags: [cross-reference, implicit-book]

  false_positives:
    - id: en-prose-fp-001
      description: JavaScript file references should NOT match
      input: "react-dom.development.js:65 Warning: Invalid DOM property"
      expected_refs: []
      tags: [false-positive, code-noise]

    - id: en-prose-fp-002
      description: Time notation should NOT match
      input: "The meeting is at 3:16 PM in room 12:30"
      expected_refs: []
      tags: [false-positive, time-format]

    - id: en-prose-fp-003
      description: Version numbers should NOT match
      input: "Updated to version 1:2:3 and release 4.5.6"
      expected_refs: []
      tags: [false-positive, version-number]
```

### Prose Test Runner

```javascript
// test/detect/detect-prose.critical.test.js
import { detectReferences, generateReference } from '../../dist/scriptures.mjs';
import { loadProseFixtures } from '../helpers/fixture-loader.js';

const fixtures = loadProseFixtures('en');

describe('detectReferences - Prose Paragraphs', () => {

  describe.each(fixtures.paragraphs.critical)('$id: $description', (tc) => {

    test('contextAware: true - finds all expected refs', () => {
      const foundRefs = [];

      detectReferences(
        tc.input,
        (originalText, verseIds) => {
          foundRefs.push({
            original: originalText,
            ids: verseIds,
            canonical: generateReference(verseIds, tc.language || 'en')
          });
          return `[${originalText}]`;
        },
        { language: 'en', contextAware: true }
      );

      const expectedCount = tc.context_variations?.contextAware_true?.ref_count
        || tc.expected_refs.length;
      expect(foundRefs.length).toBe(expectedCount);

      // Verify each expected ref was found
      for (const expected of tc.expected_refs) {
        if (!expected.context_required || true) {
          const found = foundRefs.find(f =>
            JSON.stringify(f.ids) === JSON.stringify(expected.ids)
          );
          expect(found).toBeDefined();
        }
      }
    });

    test('contextAware: false - finds only explicit refs', () => {
      const foundRefs = [];

      detectReferences(
        tc.input,
        (originalText, verseIds) => {
          foundRefs.push({
            original: originalText,
            ids: verseIds
          });
          return `[${originalText}]`;
        },
        { language: 'en', contextAware: false }
      );

      const expectedCount = tc.context_variations?.contextAware_false?.ref_count
        || tc.expected_refs.filter(r => !r.context_required).length;
      expect(foundRefs.length).toBe(expectedCount);
    });
  });
});

describe('detectReferences - False Positives', () => {

  describe.each(fixtures.paragraphs.false_positives)('$id: $description', (tc) => {

    test('should NOT detect any references', () => {
      const foundRefs = [];

      detectReferences(
        tc.input,
        (originalText, verseIds) => {
          foundRefs.push({ original: originalText, ids: verseIds });
          return `[${originalText}]`;
        },
        { language: 'en', contextAware: true }
      );

      expect(foundRefs).toEqual([]);
    });
  });
});
```

### Full File Snapshot Testing

For regression testing against real-world prose files, use Jest snapshots:

```javascript
// test/detect/detect-snapshots.test.js
import { detectReferences, generateReference } from '../../dist/scriptures.mjs';
import { readFileSync } from 'fs';
import { join } from 'path';

const loadProseSample = (lang, filename) => {
  return readFileSync(join('test/prose-samples', lang, filename), 'utf8');
};

describe('detectReferences - Snapshot Regression', () => {

  describe('English prose samples', () => {
    test('vvtest-en.txt produces expected output', () => {
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

    test('testDetect.en.txt produces expected output', () => {
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

    test('testDetect.en.txt with contextAware: false', () => {
      const content = loadProseSample('en', 'testDetect.en.txt');
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
  });

  describe('Korean prose samples', () => {
    test('vvtest-ko.txt produces expected output', () => {
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

### Helper Function Extension

```javascript
// test/helpers/fixture-loader.js (addition)

export function loadProseFixtures(language = null) {
  const pattern = language
    ? `test/fixtures/detect-prose/${language}.yml`
    : 'test/fixtures/detect-prose/*.yml';

  const files = glob.sync(pattern);
  if (files.length === 0) {
    throw new Error(`No prose fixtures found for pattern: ${pattern}`);
  }

  return files.map(file => {
    const content = readFileSync(file, 'utf8');
    return parse(content);
  })[0]; // Return single language fixture
}
```

### Prose Test Categories

| Test Type | Purpose | File Pattern |
|-----------|---------|--------------|
| **Prose paragraphs** | Multi-sentence with context-dependent refs | `detect-prose.critical.test.js` |
| **False positives** | Ensure code paths, times, versions don't match | `detect-prose.critical.test.js` |
| **Snapshot tests** | Lock full-file output for regression | `detect-snapshots.test.js` |
| **Edge cases** | HTML, packed refs, implicit books | `detect-prose.edge-cases.test.js` |

## CI Configuration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
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
        run: npm run test:critical -- --ci --coverage

      - name: Enforce Coverage Threshold
        run: |
          npm run test:critical -- --ci --coverageThreshold='{"global":{"branches":80,"functions":80,"lines":80}}'

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
        run: npm run test:known-issues -- --ci --json --outputFile=known-issues-report.json

      - name: Upload Report
        uses: actions/upload-artifact@v4
        with:
          name: known-issues-report
          path: known-issues-report.json

  full-matrix:
    name: Full Language Matrix
    runs-on: ubuntu-latest
    needs: critical
    strategy:
      matrix:
        language: [en, ko, de, swe, ru, vn, fr, tgl, jp, tr, slv, eo]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run build

      - name: Test ${{ matrix.language }}
        run: npm run test:lang -- --lang=${{ matrix.language }} --ci
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:critical": "jest --testPathPattern='critical\\.test\\.js$'",
    "test:edge": "jest --testPathPattern='edge-cases\\.test\\.js$'",
    "test:known-issues": "jest --testPathPattern='known-issues\\.test\\.js$'",
    "test:lang": "jest --testPathPattern='\\.(critical|edge-cases)\\.test\\.js$'",
    "test:all": "jest --coverage"
  }
}
```

### Jest Configuration

```javascript
// jest.config.js
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
  globals: {
    TEST_LANGUAGE: process.env.TEST_LANGUAGE || null
  }
};
```

## Test Generation Strategy

### Generation Scripts

```javascript
// scripts/generate-fixtures.mjs
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { stringify } from 'yaml';

const LANGUAGES = {
  en: { name: 'English', bookCount: 66, hasAbbreviations: true },
  ko: { name: 'Korean', bookCount: 66, hasAbbreviations: true, notes: 'Hangul book names' },
  de: { name: 'German', bookCount: 66, hasAbbreviations: true },
  fr: { name: 'French', bookCount: 66, hasAbbreviations: true, notes: 'Accent handling' },
  vn: { name: 'Vietnamese', bookCount: 66, notes: 'Dashes in book names, diacritics' },
  jp: { name: 'Japanese', bookCount: 66, notes: 'Kanji/hiragana book names' },
  ru: { name: 'Russian', bookCount: 66, notes: 'Cyrillic, case variations' },
};

const PATTERNS = {
  lookup: {
    simple: ['Book Chapter:Verse', 'Book Chapter', 'Abbreviation Chapter:Verse'],
    ranges: ['Book Ch:V-V', 'Book Ch-Ch', 'Book Ch:V-Ch:V'],
    compound: ['Book Ch:V,V,V', 'Book Ch:V; Book Ch:V', 'Book Ch:V,V-V'],
    multibook: ['Book Ch - Book Ch', 'Book Ch:V - Book Ch:V']
  },
  detect: {
    inline: ['See REF for details', 'Compare REF and REF'],
    contextual: ['In REF we read... later in v. N', 'REF says... see also vv. N-M'],
    noisy: ['REF (emphasis added)', 'cf. REF; REF', 'REF—REF']
  },
  edge_cases: {
    whitespace: ['double spaces', 'tabs', 'non-breaking spaces', 'zero-width chars'],
    delimiters: ['periods vs colons', 'em-dash vs hyphen', 'no spaces around semicolons'],
    diacritics: ['with accents', 'without accents', 'mixed normalization']
  }
};

export function buildPrompt(language, category, tier) {
  const langConfig = LANGUAGES[language];

  return `
Generate test cases for a scripture reference parser in ${langConfig.name}.

LANGUAGE NOTES: ${langConfig.notes || 'Standard Latin alphabet'}
CATEGORY: ${category} (${tier} tier)

PATTERNS TO COVER:
${JSON.stringify(PATTERNS[category] || PATTERNS.lookup, null, 2)}

OUTPUT FORMAT (YAML):
- id: ${language}-${category}-${tier}-001
  input: "..."
  expected_ids: [N, N, N]
  expected_ref: "..."
  description: Brief description
  ${tier === 'edge_cases' ? 'tags: [tag1, tag2]' : ''}

REQUIREMENTS:
1. Generate 20 diverse test cases
2. Use REAL book names and valid chapter/verse numbers
3. Include common abbreviations
4. For edge cases, introduce realistic formatting anomalies
5. Verse IDs: Genesis 1:1 = 1, cumulative count

Generate the YAML now:
`;
}
```

### Validation Script

```javascript
// scripts/validate-fixtures.mjs
import { readFileSync } from 'fs';
import { parse } from 'yaml';
import { glob } from 'glob';
import { lookupReference, generateReference } from '../dist/scriptures.mjs';

const files = glob.sync('test/fixtures/*.yml');
let errors = [];

for (const file of files) {
  const content = parse(readFileSync(file, 'utf8'));
  const lang = content.language;

  console.log(`Validating ${file}...`);

  for (const tier of ['critical', 'edge_cases']) {
    for (const tc of content.lookup?.[tier] || []) {
      const result = lookupReference(tc.expected_ref, lang);
      if (JSON.stringify(result.verse_ids) !== JSON.stringify(tc.expected_ids)) {
        errors.push({
          file,
          id: tc.id,
          issue: 'expected_ids mismatch',
          expected: tc.expected_ids,
          actual: result.verse_ids
        });
      }
    }
  }

  for (const tier of ['critical', 'edge_cases']) {
    for (const tc of content.generate?.[tier] || []) {
      const result = generateReference(tc.input_ids, lang);
      if (result !== tc.expected) {
        errors.push({
          file,
          id: tc.id,
          issue: 'generate output mismatch',
          expected: tc.expected,
          actual: result
        });
      }
    }
  }
}

if (errors.length > 0) {
  console.error('\n❌ Validation errors:');
  errors.forEach(e => console.error(JSON.stringify(e, null, 2)));
  process.exit(1);
} else {
  console.log('\n✅ All fixtures valid');
}
```

### Generation Process

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. SEED GENERATION                                              │
│    - Use LLM to generate initial 20-30 cases per category      │
│    - Human reviews for accuracy                                 │
│    - Run validate-fixtures.mjs to catch ID errors              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. EXPANSION PROMPTS                                            │
│    - "Generate 10 more cases focusing on [X pattern]"          │
│    - "Add edge cases for [diacritics/whitespace/etc]"          │
│    - Append to existing fixture files                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. BUG-DRIVEN ADDITIONS                                         │
│    - When a bug is found, add it as known_issue first          │
│    - After fix, move to edge_cases with regression tag         │
│    - Ensures bugs never resurface                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. NEW LANGUAGE BOOTSTRAP                                       │
│    - Copy en.yml structure                                      │
│    - Prompt: "Translate these test cases to [language]"        │
│    - Add language-specific edge cases                          │
│    - Validate with native speaker if possible                  │
└─────────────────────────────────────────────────────────────────┘
```

## Target Coverage

| Category | Per Language | Total (12 langs) |
|----------|--------------|------------------|
| lookup.critical | 30 | 360 |
| lookup.edge_cases | 20 | 240 |
| lookup.invalid | 10 | 120 |
| generate.critical | 20 | 240 |
| generate.edge_cases | 15 | 180 |
| detect.critical (inline) | 15 | 180 |
| detect.edge_cases (inline) | 20 | 240 |
| detect-prose.critical | 10 | 120 |
| detect-prose.edge_cases | 15 | 180 |
| detect-prose.false_positives | 10 | 120 |
| snapshot tests | 3-5 files | ~50 |
| known_issues | varies | ~50 |
| **Total** | **~170** | **~2,100+** |

## CI/CD Tiers Summary

| Tier | Blocks | Coverage |
|------|--------|----------|
| `critical` | PR merge | Core functionality, ~80% of cases |
| `edge-cases` | npm publish | Whitespace, delimiters, diacritics |
| `known-issues` | Nothing (reports) | Documented bugs awaiting fix |

## Implementation Steps

1. Install Jest and yaml dependencies
2. Create directory structure (including `detect-prose/` and `prose-samples/`)
3. Implement fixture-loader helper (including `loadProseFixtures`)
4. Generate initial en.yml fixture file
5. Implement lookup test files (critical, edge-cases, known-issues)
6. Implement generate test files
7. Implement detect inline test files
8. Migrate existing prose samples to `test/prose-samples/en/`
9. Create prose fixture file `test/fixtures/detect-prose/en.yml`
10. Implement detect-prose test files (critical, edge-cases)
11. Implement detect-snapshots.test.js for full-file regression
12. Implement roundtrip test files
13. Implement language fallback tests
14. Configure Jest (including snapshot settings)
15. Add npm scripts
16. Set up GitHub Actions workflow
17. Generate fixtures for remaining languages
18. Generate prose fixtures for remaining languages
19. Run validation script
20. Achieve 80% coverage threshold

## Open Questions

- Do we need performance benchmarks as part of the test suite?
- Should fixtures be versioned separately from code?
- Should prose samples be collected from additional real-world sources (commentaries, study guides)?
- How should we handle snapshot updates when intentional changes are made to detection output?
