# Community of Christ (COC) Versification Adapter

**Date:** 2026-01-11
**Status:** Draft
**Branch:** contextDetection

## Problem Statement

Community of Christ (formerly RLDS) uses different versification than LDS for the Book of Mormon:
- LDS 1 Nephi has 22 chapters; COC has 7 chapters
- Verse boundaries don't align (some merged, some split)
- Current `verse_id` system assumes single canonical versification

Example from cross-reference:
- RLDS `1 Nephi 1:1-23` = LDS `1 Nephi 1:1-20` (23 vs 20 verses)
- RLDS `1 Nephi 1:1` contains text from LDS `1 Nephi 1:1` + `1:2` (merged)

## Goals

1. **Bidirectional conversion** - Parse COC references → LDS verse_ids and vice versa
2. **Parallel display** - Show both versifications for a passage
3. **Partial mapping flags** - Indicate when verse boundaries don't align exactly
4. **Backward compatibility** - Existing LDS-based code unchanged

## Design Decisions

### 1. Verse ID Namespace

**COC verse_ids:** `C00001`, `C00002`, ... `C06839`
- C-prefix distinguishes from LDS integers
- Zero-padded to 5 digits for consistent sorting
- Sequential within COC canon

**LDS verse_ids:** Unchanged integers (e.g., `31103` = 1 Nephi 1:1)

### 2. Terminology

Use `canon` (not "edition") to distinguish versification systems:
- "Edition" implies text translation (KJV, NRSV) — same verse structure
- "Canon" implies structural differences — different chapter/verse divisions

### 3. Partial Mapping Strategy

When verses don't align 1:1:
- **Expand:** Return all matching verse_ids
- **Flag:** Set `partial: true` in response

```js
// COC 1:1 spans LDS 1:1 + 1:2
{ verse_ids: [31103, 31104], partial: true }
```

## API Design

### Enhanced `lookupReference()`

```js
lookupReference(query, language?, options?)

// Options:
{
  canon: "lds" | "coc",        // Which versification to parse as
  convertTo: "lds" | "coc",    // Convert result to different canon
  includeParallel: true        // Include both canons in response
}
```

**Examples:**

```js
// Basic COC lookup
lookupReference("1 Nephi 1:50", "en", { canon: "coc" })
// → { query: "1 Nephi 1:50", ref: "1 Nephi 1:50", verse_ids: ["C00050"] }

// COC lookup with conversion to LDS
lookupReference("1 Nephi 1:50", "en", { canon: "coc", convertTo: "lds" })
// → {
//     query: "1 Nephi 1:50",
//     ref: "1 Nephi 2:3-4",
//     verse_ids: [31125, 31126],
//     partial: true,
//     sourceCanon: "coc"
//   }

// COC lookup with parallel display
lookupReference("1 Nephi 1:50", "en", { canon: "coc", includeParallel: true })
// → {
//     query: "1 Nephi 1:50",
//     ref: "1 Nephi 1:50",
//     verse_ids: ["C00050"],
//     parallel: {
//       canon: "lds",
//       ref: "1 Nephi 2:3-4",
//       verse_ids: [31125, 31126],
//       partial: true
//     }
//   }
```

### New `convertCanon()` Function

```js
convertCanon(verseIds, options?)

// Options:
{
  to: "lds" | "coc"   // Target canon (source auto-detected from ID format)
}
```

**Examples:**

```js
// COC to LDS
convertCanon(["C00050", "C00051"], { to: "lds" })
// → { verse_ids: [31125, 31126, 31127], partial: true }

// LDS to COC
convertCanon([31125, 31126], { to: "coc" })
// → { verse_ids: ["C00050"], partial: true }
```

### Enhanced `generateReference()`

Auto-detects canon from verse_id format:

```js
generateReference(["C00001", "C00023"])
// → "1 Nephi 1:1-23" (COC format)

generateReference([31103, 31122])
// → "1 Nephi 1:1-20" (LDS format, unchanged)
```

## Data Architecture

### File Structure

```
src/
├── scriptures.mjs          # Main entry (enhanced)
├── scriptcanon.mjs         # NEW: Canon conversion logic
├── scriptdetect.mjs        # Existing
└── scriptdetectcontext.mjs # Existing

data/
├── scriptdata.mjs          # Existing LDS structure
├── coc.mjs                 # Existing COC structure
└── coc-mapping.mjs         # NEW: Generated mapping tables
```

### Mapping Data Structure

`data/coc-mapping.mjs`:

```js
export default {
  // COC → LDS mapping
  cocToLds: {
    1: { lds: [31103, 31104], partial: true },  // C00001 spans 2 LDS verses
    2: { lds: [31105], partial: false },         // C00002 = 1 LDS verse
    // ... ~6800 entries
  },

  // LDS → COC mapping (reverse index)
  ldsToCoc: {
    31103: { coc: [1], partial: true },   // Part of C00001
    31104: { coc: [1], partial: true },   // Part of C00001
    31105: { coc: [2], partial: false },  // Exact match
    // ...
  }
}
```

## Internal Implementation

### scriptcanon.mjs

```js
import cocMapping from '../data/coc-mapping.mjs';

// Detect canon from verse_id format
export const detectCanon = (verseId) => {
  if (typeof verseId === 'string' && /^C\d+$/.test(verseId)) return 'coc';
  if (typeof verseId === 'number' || /^\d+$/.test(verseId)) return 'lds';
  return null;
};

// Format: 50 → "C00050"
export const formatCocId = (num) => `C${String(num).padStart(5, '0')}`;

// Parse: "C00050" → 50
export const parseCocId = (id) => parseInt(id.slice(1), 10);

// Convert COC → LDS
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

// Convert LDS → COC
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

## Edge Cases

### 1. Partial Mappings

When one verse spans multiple in the other canon:
- Return all matching verse_ids
- Set `partial: true`

### 2. Range Queries

If any verse in a range has partial mapping, the entire result is marked `partial: true`.

### 3. Books Not in COC Canon

D&C, Pearl of Great Price, etc. exist only in LDS:

```js
lookupReference("D&C 1:1", "en", { canon: "coc" })
// → { verse_ids: [], error: "not_in_canon" }
```

### 4. Bible References

Bible verses share the same verse_ids in both canons (no conversion needed):

```js
lookupReference("John 3:16", "en", { canon: "coc", includeParallel: true })
// → { verse_ids: [26137], parallel: { verse_ids: [26137], partial: false } }
```

### 5. Mixed Canon Input

Reject mixed verse_id formats:

```js
convertCanon(["C00001", 31103], { to: "lds" })
// → { error: "mixed_canon_input" }
```

## Build Script

### Data Sources

- **LDS:** `lds.txt` (local TSV with verse_id, chapter, verse, text)
- **COC:** `https://centerplace.org/hs/bm/{book}.htm`

### Generation Process

`build/generate-coc-mapping.js`:

1. Parse `lds.txt` → array of `{verse_id, book, chapter, verse, text}`
2. Fetch RLDS books from centerplace.org
3. Normalize text (lowercase, strip punctuation, first 200 chars)
4. Align using sliding window + Jaccard text similarity (threshold: 0.6)
5. Generate bidirectional mapping with partial flags
6. Output `data/coc-mapping.mjs`

### Usage

```bash
npm run generate-coc-mapping
```

## Exports

New exports from main module:

```js
export {
  // Existing
  lookupReference,
  generateReference,
  setLanguage,
  detectReferences,

  // New
  convertCanon,

  // Aliases
  convertCanon as convert,
  convertCanon as translateCanon,
};
```

## Testing Strategy

1. **Unit tests** for `scriptcanon.mjs` functions
2. **Integration tests** comparing against PDF cross-reference table
3. **Snapshot tests** for generated mapping data
4. **Edge case tests** for partial mappings, missing books, Bible refs

## Migration / Backward Compatibility

- All existing API calls work unchanged (default `canon: "lds"`)
- New options are additive
- LDS verse_ids remain integers
- No breaking changes

## Future Considerations

- Additional canons (e.g., 1830 edition versification)
- Multiple COC editions (1908, 1966 Revised)
- Performance optimization for large range queries
- Caching of generated mappings
