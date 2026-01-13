# Multi-Canon Architecture Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:writing-plans to create implementation plan from this design.

**Goal:** Refactor scripture-guide to support multiple canons (Bible, LDS, Apocrypha, Shakespeare, etc.) with YAML-based data files, flexible API, and cross-canon features.

**Architecture:** Canon-first file organization with shared language patterns. Each canon defines its structure and can extend other canons (LDS extends Bible). Verse IDs are namespaced integers with optional prefix syntax for explicit disambiguation.

**Key Decisions:**
- Configurable default canon via `setDefaults()`
- String parameter cascades: language first, then canon
- Fuzzy canon matching on by default
- YAML for maintainability, compiled to JS for production

---

## Section 1: File Structure

```
data/
  shared/
    en.yml              # English patterns (chapter, verse, numerals)
    ko.yml              # Korean patterns
    de.yml

  canons/
    bible/
      _structure.yml    # books, chapters, verse IDs (1-31102)
      _mappings.yml     # cross-references to other canons
      en.yml            # Genesis, Exodus... with abbreviations
      ko.yml

    lds/
      _structure.yml    # extends: bible, id_start: 31103
      _mappings.yml     # COC mappings, JST mappings
      en.yml            # 1 Nephi, D&C...
      ko.yml

    coc/
      _structure.yml    # extends: bible, different versification
      _mappings.yml     # LDS↔COC verse alignments
      en.yml

    apocrypha/
      _structure.yml
      en.yml

    shakespeare/
      _structure.yml    # id_format: hierarchical
      en.yml            # Hamlet, Macbeth...
```

**Conventions:**
- `shared/` contains language patterns (delimiters, numerals, joiners)
- `canons/` contains canon-specific structure and book names
- `_` prefix for non-language files (_structure.yml, _mappings.yml)
- `extends` allows canon inheritance (LDS extends Bible)

**Canon Priority Order:**
1. bible
2. lds
3. apocrypha
4. coc
5. koran
6. gita
7. dhammapada
8. taoteching
9. vedas
10. constitution
11. shakespeare

---

## Section 2: YAML Schemas

### Shared Language File

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
  - pattern: "\\bIV\\s+(?=[A-Za-z])"
    replacement: "4 "
  - pattern: "\\bIII\\s+(?=[A-Za-z])"
    replacement: "3 "
  - pattern: "\\bII\\s+(?=[A-Za-z])"
    replacement: "2 "
  - pattern: "\\bI\\s+(?=[A-Za-z])"
    replacement: "1 "
  - pattern: "\\bfirst\\s+(?=[A-Za-z])"
    replacement: "1 "
  - pattern: "\\bsecond\\s+(?=[A-Za-z])"
    replacement: "2 "
  - pattern: "\\bchapter\\s+(\\d+),?\\s*verse\\s+(\\d+)"
    replacement: "$1:$2"

post_rules:
  - pattern: "\\s+"
    replacement: " "
```

### Canon Structure File

```yaml
# data/canons/bible/_structure.yml
canon: bible
name: "Holy Bible (KJV)"
description: "King James Version - 66 books"

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

  # ... remaining books

  - key: revelation
    order: 66
    chapters: 22
    first_verse_id: 30699
```

```yaml
# data/canons/lds/_structure.yml
canon: lds
name: "LDS Restoration Scripture"
description: "Book of Mormon, D&C, Pearl of Great Price"

extends: bible            # inherits Bible books
id_format: integer
id_start: 31103           # continues after Bible
id_end: 41995

books:
  - key: 1_nephi
    order: 67
    chapters: 22
    verses: [20, 24, 31, 38, 22, 6, 22, 40, 42, 19, 36, 23, 42, 30, 36, 39, 55, 25, 24, 22, 26, 31]
    first_verse_id: 31103

  - key: doctrine_and_covenants
    order: 83
    chapters: 138
    first_verse_id: 37707

  - key: articles_of_faith
    order: 87
    chapters: 1
    verses: [13]
    first_verse_id: 41983
```

### Canon Language File

```yaml
# data/canons/lds/en.yml
canon: lds
language: en

books:
  genesis:
    name: "Genesis"
    abbreviations: ["gen", "gn"]
    alternates: ["1 moses", "first book of moses"]

  psalms:
    name: "Psalms"
    abbreviations: ["ps", "pss", "psa", "psalm"]
    singular: "Psalm"

  song_of_solomon:
    name: "Song of Solomon"
    abbreviations: ["song", "sos", "ss"]
    alternates: ["song of songs", "canticles"]

  revelation:
    name: "Revelation"
    abbreviations: ["rev", "re", "apoc"]
    alternates: ["revelations", "apocalypse"]

  1_nephi:
    name: "1 Nephi"
    abbreviations: ["1 ne", "1ne", "1 nep"]
    alternates: ["first nephi", "I nephi"]

  doctrine_and_covenants:
    name: "Doctrine and Covenants"
    abbreviations: ["d&c", "dc", "d and c"]
    chapter_label: "section"

pre_rules:
  - pattern: "\\bgospel\\s+(?:of|according\\s+to)\\s+"
    replacement: ""
  - pattern: "\\bepistle\\s+(?:of|to(?:\\s+the)?)\\s+(?!jeremiah)"
    replacement: ""
```

### Mappings File

```yaml
# data/canons/lds/_mappings.yml
canon: lds
mappings:

  coc:
    type: verse_alignment
    description: "COC Book of Mormon uses different versification"
    bidirectional: true
    book_scope: [1_nephi, 2_nephi, jacob, enos, jarom, omni, words_of_mormon, mosiah, alma, helaman, 3_nephi, 4_nephi, mormon, ether, moroni]
    verses:
      31103: C1
      31104: C2
      31105: C3
      # ... generated mappings

  bible:
    type: parallel
    description: "JST and Moses/Abraham parallels"
    passages:
      - lds: [moses, 1, 1-42]
        bible: null
        note: "JST Genesis 0"
      - lds: [abraham, 3, 22-28]
        bible: null
        note: "Pre-existence account"

  quotations:
    type: quotation
    description: "Book of Mormon quoting Bible"
    quotes:
      - source: [isaiah, 2, 1-22]
        target: [2_nephi, 12, 1-22]
        relationship: "quoted"
```

### Non-Scripture Canon Example

```yaml
# data/canons/shakespeare/_structure.yml
canon: shakespeare
name: "Complete Works of Shakespeare"
description: "Plays and sonnets with act/scene/line references"

id_format: hierarchical
id_pattern: "{play}.{act}.{scene}.{line}"

works:
  - key: hamlet
    type: play
    order: 1
    acts: 5
    scenes: [5, 2, 4, 7, 2]

  - key: macbeth
    type: play
    order: 2
    acts: 5
    scenes: [7, 4, 6, 3, 8]

  - key: sonnets
    type: poetry
    order: 37
    count: 154
    lines_per: 14
```

---

## Section 3: API Design

### Primary Functions

```javascript
// lookupReference - string to verse IDs
lookupReference(query, options?)
lookupReference("John 3:16")                    // all defaults
lookupReference("요한복음 3:16", "ko")          // language as string
lookupReference("1 Nephi 1:1", "lds")           // canon as string
lookupReference("Hamlet 1.2.15", {              // full config
  language: "en",
  canon: "shakespeare",
  fuzzyCanon: false
})

// generateReference - verse IDs to string
generateReference(verseIds, options?)
generateReference([26137], "ko")                // → "요한복음 3:16"
generateReference([31103], { canon: "lds" })    // → "1 Nephi 1:1"

// detectReferences - find refs in prose
detectReferences(text, callback, options?)
detectReferences("Read John 3:16 and Hamlet 1.2.15", fn, {
  fuzzyCanon: true
})

// convertReference - cross-canon mapping
convertReference(verseIds, { from: "lds", to: "coc" })

// setDefaults - global configuration
setDefaults({
  language: 'en',
  canon: 'lds',
  fuzzyCanon: true
})
```

### Options Resolution Cascade

```javascript
resolveOptions(input) {
  if (input === undefined)
    return { language: getDefault('language'), canon: getDefault('canon') }

  if (typeof input === 'string') {
    if (isKnownLanguage(input))
      return { language: input, canon: getDefault('canon') }
    if (isKnownCanon(input))
      return { language: getDefault('language'), canon: input }
    throw new Error(`Unknown language or canon: ${input}`)
  }

  return { ...getDefaults(), ...input }
}
```

### Return Value Structure

```javascript
// Successful lookup
{
  query: "Hamlet 1.2.15",
  ref: "Hamlet 1.2.15",
  verse_ids: ["hamlet.1.2.15"],
  canon: "shakespeare",
  fuzzy_match: true,           // was fuzzyCanon used?
  original_canon: "lds",       // what was requested
  language: "en"
}

// Error response
{
  query: "Genisis 1:1",
  ref: "",
  verse_ids: [],
  canon: "bible",
  error: "book_not_found",
  error_message: "Book 'Genisis' not found",
  suggestions: [
    { book: "Genesis", confidence: 0.95 }
  ]
}
```

### Explicit Canon Prefix

```javascript
// Prefix bypasses fuzzy matching
lookupReference("lds:1 Nephi 1:1")     // explicit LDS
lookupReference("bible:Genesis 1:1")   // explicit Bible
lookupReference("coc:C5023")           // explicit COC verse ID
```

---

## Section 4: Data Loading & Merging

### Canon Loading

```javascript
function loadCanon(canonName) {
  const cache = getCache(canonName)
  if (cache) return cache

  // 1. Load canon structure
  const structure = loadYaml(`canons/${canonName}/_structure.yml`)

  // 2. If extends, recursively load parent first
  let merged = {}
  if (structure.extends) {
    const parent = loadCanon(structure.extends)
    merged = deepClone(parent)
  }

  // 3. Merge this canon's books (append after parent)
  merged.books = [...(merged.books || []), ...structure.books]
  merged.id_start = structure.id_start || merged.id_end + 1 || 1
  merged.id_end = structure.id_end

  // 4. Load mappings if present
  merged.mappings = loadYaml(`canons/${canonName}/_mappings.yml`) || {}

  setCache(canonName, merged)
  return merged
}
```

### Language Loading

```javascript
function loadLanguage(canonName, langCode) {
  const cacheKey = `${canonName}:${langCode}`
  const cache = getCache(cacheKey)
  if (cache) return cache

  // 1. Load shared language patterns
  const shared = loadYaml(`shared/${langCode}.yml`)

  // 2. Load canon-specific book names
  const canonLang = loadYaml(`canons/${canonName}/${langCode}.yml`)

  // 3. If canon extends another, load parent's language too
  const structure = loadYaml(`canons/${canonName}/_structure.yml`)
  let parentLang = {}
  if (structure.extends) {
    parentLang = loadLanguage(structure.extends, langCode)
  }

  // 4. Merge: shared → parent → canon-specific
  const merged = deepMerge(shared, parentLang, canonLang)

  setCache(cacheKey, merged)
  return merged
}
```

### Build-Time Compilation

```javascript
// build/compile-canons.mjs
for (const canon of findCanons()) {
  const structure = loadCanon(canon)
  const languages = findLanguages(canon)

  for (const lang of languages) {
    const merged = loadLanguage(canon, lang)

    const output = {
      bookIndex: buildBookIndex(structure, merged),
      verseIndex: buildVerseIndex(structure),
      regexPatterns: compileRegex(merged),
      preRules: compileRules(merged.pre_rules),
      postRules: compileRules(merged.post_rules)
    }

    writeJs(`dist/data/${canon}/${lang}.mjs`, output)
  }
}
```

### Runtime Modes

| Mode | YAML Loading | Use Case |
|------|--------------|----------|
| Development | Runtime parsing | Edit YAML, see changes immediately |
| Production | Pre-compiled JS | Fast startup, smaller bundle |
| Testing | Runtime parsing | Test fixtures in YAML |

---

## Section 5: Canon Resolution & Fuzzy Matching

### Resolution Flow

```javascript
function resolveReference(query, options) {
  const { canon, language, fuzzyCanon } = resolveOptions(options)

  // 1. Try specified canon first
  const result = tryLookup(query, canon, language)
  if (result.found) {
    return { ...result, fuzzy_match: false }
  }

  // 2. If fuzzyCanon enabled, search other canons
  if (fuzzyCanon) {
    const allCanons = getLoadedCanons().filter(c => c !== canon)

    for (const altCanon of allCanons) {
      const altResult = tryLookup(query, altCanon, language)
      if (altResult.found) {
        return {
          ...altResult,
          canon: altCanon,
          fuzzy_match: true,
          original_canon: canon
        }
      }
    }
  }

  // 3. Not found anywhere
  return {
    query,
    error: fuzzyCanon
      ? "Book not found in any loaded canon"
      : `Book not found in canon: ${canon}`,
    verse_ids: []
  }
}
```

### Book Disambiguation

```javascript
function findBookCanons(bookName, language) {
  const matches = []

  for (const canon of getLoadedCanons()) {
    const langData = loadLanguage(canon, language)
    if (matchesBook(bookName, langData)) {
      matches.push({
        canon,
        book: resolveBookKey(bookName, langData),
        confidence: calculateConfidence(bookName, langData)
      })
    }
  }

  return matches.sort((a, b) => b.confidence - a.confidence)
}

function calculateConfidence(input, langData) {
  if (matchesExact(input, langData.books)) return 100
  if (matchesAbbreviation(input, langData.books)) return 80
  if (matchesAlternate(input, langData.books)) return 60
  return 40
}
```

### Prefix Parsing

```javascript
function parseQuery(query) {
  const prefixMatch = query.match(/^(\w+):(.+)$/)

  if (prefixMatch) {
    const [, prefix, rest] = prefixMatch
    if (isKnownCanon(prefix)) {
      return {
        query: rest.trim(),
        explicitCanon: prefix,
        fuzzyCanon: false
      }
    }
  }

  return { query, explicitCanon: null }
}
```

---

## Section 6: Cross-Canon Mappings

### Mapping Types

```yaml
# Type 1: Verse alignment (same text, different numbering)
coc:
  type: verse_alignment
  bidirectional: true
  verses:
    31103: C1
    31104: C2

# Type 2: Parallel passages (same content, different books)
bible:
  type: parallel
  passages:
    - lds: [moses, 1, 1-42]
      bible: null
      note: "JST Genesis 0"

# Type 3: Quotations (one text quotes another)
quotations:
  type: quotation
  quotes:
    - source: [isaiah, 2, 1-22]
      target: [2_nephi, 12, 1-22]
```

### Mapping API

```javascript
// Convert between canons
convertReference(verseIds, { from: "lds", to: "coc" })
// → { verse_ids: ["C1", "C2", "C3"], canon: "coc", partial: false }

// Find parallel passages
findParallels(verseIds, options)
// → [{ canon: "coc", verse_ids: ["C1"], type: "alignment" }]

// Find quotations
findQuotations([6920, 6921, ...])  // Isaiah 2:1-22
// → [{ quoted_in: "2_nephi", chapter: 12, canon: "lds" }]
```

---

## Section 7: Error Handling

### Error Codes

```javascript
const ErrorCodes = {
  INVALID_INPUT: "invalid_input",
  QUERY_TOO_LONG: "query_too_long",
  BOOK_NOT_FOUND: "book_not_found",
  CHAPTER_NOT_FOUND: "chapter_not_found",
  VERSE_NOT_FOUND: "verse_not_found",
  INVALID_RANGE: "invalid_range",
  CANON_NOT_FOUND: "canon_not_found",
  CANON_NOT_LOADED: "canon_not_loaded",
  LANGUAGE_NOT_FOUND: "language_not_found",
  LANGUAGE_NOT_AVAILABLE: "language_not_available",
  MAPPING_NOT_AVAILABLE: "mapping_not_available",
  MAPPING_PARTIAL: "mapping_partial",
}
```

### Graceful Degradation

```javascript
// Partial success - range truncated
lookupReference("Genesis 1:1-999", "bible")
// → { ref: "Genesis 1:1-31", warning: "range_truncated" }

// Suggestions on failure
lookupReference("Genisis 1:1", "bible")
// → { error: "book_not_found", suggestions: [{ book: "Genesis", confidence: 0.95 }] }
```

---

## Section 8: Testing Strategy

### Fixture Structure

```
test/fixtures/
  canons/
    bible/
      lookup/critical.yml
      detect/negative.yml
    lds/
      lookup/critical.yml
      cross-canon/coc-mappings.yml
    shakespeare/
      lookup/plays.yml
  shared/
    cross-canon/fuzzy-matching.yml
```

### Fixture Schema

```yaml
description: Critical LDS lookup tests
canon: lds
language: en

tests:
  - id: lds-lookup-001
    input: "1 Nephi 1:1"
    expected:
      ref: "1 Nephi 1:1"
      verse_ids: [31103]
      canon: lds
    tags: [critical, book-of-mormon]
```

---

## Section 9: Migration Strategy

### Phases

| Phase | Description | Breaking |
|-------|-------------|----------|
| 1 | Add YAML loader alongside MJS | No |
| 2 | Extract Bible to separate canon | No |
| 3 | New API with options cascade | Yes (v2.0) |
| 4 | Add additional canons | No |

### Backward Compatibility

```javascript
// v1: string = language only
lookupReference("John 3:16", "en")

// v2: string = language first, then canon
lookupReference("John 3:16", "en")   // still works
lookupReference("John 3:16", "lds")  // new: canon
lookupReference("John 3:16", { language: "en", canon: "lds" })  // explicit
```

### Version Matrix

| Version | String Param | Object Param | fuzzyCanon |
|---------|--------------|--------------|------------|
| 1.x | language only | no | no |
| 2.0 | language → canon cascade | yes | on by default |

---

## Summary

This architecture provides:

1. **Maintainability** - YAML files are easier to edit than hardcoded JS
2. **Extensibility** - Add new canons by adding folders
3. **Composability** - Canons can extend other canons
4. **Flexibility** - Smart defaults with explicit overrides
5. **Cross-canon features** - Mappings, fuzzy matching, parallel passages
6. **Backward compatibility** - Phased migration path

The primary trade-off is increased complexity in the loader, but this is hidden from end users who get a simpler, more powerful API.
