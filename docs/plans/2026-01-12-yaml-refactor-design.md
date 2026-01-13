# YAML Data Refactoring Design

**Date:** 2026-01-12
**Status:** Approved
**Goal:** Refactor data loading from legacy MJS files to YAML-based multi-canon architecture

## Background

The legacy data files (`scriptdata.mjs`, `scriptlang.mjs`, `scriptregex.mjs`, `coc.mjs`, `coc-mapping.mjs`) have been archived and replaced with a YAML-based structure under `data/canons/` and `data/shared/`. The source code still imports the archived files and needs refactoring.

## Decisions

| Decision | Choice |
|----------|--------|
| Deployment target | NPM package only |
| YAML handling | Build-time compilation to JS |
| Canon priority | Explicit → LDS default → auto-detect fallback |
| COC mapping loading | Lazy load on first use |
| Canon conversion API | Explicit `convertCanon()` function only |
| Result canon field | Only include when different from expected |

## Build Pipeline

### YAML Compilation Step

New script `build/compile-yaml.mjs` compiles YAML to JS modules:

```
data/                           src/data/ (compiled, gitignored)
├── canons/                     ├── canons/
│   ├── bible/                  │   ├── bible/
│   │   ├── _structure.yml  →   │   │   ├── structure.mjs
│   │   └── en.yml          →   │   │   └── en.mjs
│   ├── lds/                    │   ├── lds/
│   │   ├── _structure.yml  →   │   │   ├── structure.mjs
│   │   └── en.yml          →   │   │   └── en.mjs
│   └── coc/                    │   └── coc/
│       ├── _structure.yml  →   │       ├── structure.mjs
│       └── en.yml          →   │       └── en.mjs
└── shared/                     └── shared/
    ├── en.yml              →       ├── en.mjs
    └── ko.yml              →       └── ko.mjs
```

Additionally, `_archive/data/coc-mapping.mjs` is compiled to `src/data/canons/coc/mapping.mjs`.

### Build Command

```bash
npm run build
# 1. compile-yaml.mjs: YAML → JS in src/data/
# 2. build.mjs: Bundle to dist/
```

### Gitignore Addition

```
src/data/
```

## Data Loading Architecture

### New Module: `src/lib/data-loader.mjs`

```javascript
// Eagerly loaded (small, always needed)
import bibleStructure from '../data/canons/bible/structure.mjs';
import ldsStructure from '../data/canons/lds/structure.mjs';
import sharedEn from '../data/shared/en.mjs';

// Lazy loaded caches
let cocStructure = null;
let cocMapping = null;
let languageCache = {};

export function getCanonStructure(canon) {
  // Returns structure, lazy-loads COC if needed
  // Merges parent structure if canon extends another
}

export function getLanguageData(canon, lang) {
  // Returns merged: shared/{lang} + canons/{canon}/{lang}
  // Uses deep-merge utility
}

export async function getCocMapping() {
  // Lazy loads 881KB mapping only when convertCanon() is called
  if (!cocMapping) {
    const module = await import('../data/canons/coc/mapping.mjs');
    cocMapping = module.default;
  }
  return cocMapping;
}
```

### Loading Strategy

| Data | Loading | Reason |
|------|---------|--------|
| Bible structure | Eager | Always needed (LDS extends it) |
| LDS structure | Eager | Default canon |
| COC structure | Lazy | Only for COC references |
| COC mapping | Lazy | Only for `convertCanon()` |
| Language data | Lazy + cached | Load per language on demand |

## API Changes

### Existing Functions (Backward Compatible)

Signatures unchanged:
- `lookupReference(query, language?, config?)`
- `generateReference(verseIds, language?, config?)`
- `detectReferences(text, language?, callback?)`
- `setLanguage(lang)` / `getLanguage()`

### New Config Option

```javascript
// Explicit canon
lookupReference("1 Nephi 1:1", "en", { canon: "lds" })

// Default (LDS)
lookupReference("1 Nephi 1:1", "en")

// Auto-detect fallback (verse 150 doesn't exist in LDS 1 Nephi 3)
lookupReference("1 Nephi 3:150", "en")
// → { ref: "1 Nephi 3:150", verse_ids: [...], canon: "coc" }
```

### New Functions

```javascript
// Convert between canons
convertCanon(verseIds, { from: 'coc', to: 'lds' })
// Returns: { verse_ids: number[], partial: boolean }

// Set/get default canon
setCanon('lds')
getCanon()
```

### Result Canon Field

Only include `canon` in result when it differs from expected:

```javascript
// Using default (LDS), found in LDS → no canon field
lookupReference("John 3:16")
// → { ref: "John 3:16", verse_ids: [26136] }

// Using default (LDS), auto-detected COC → canon field included
lookupReference("1 Nephi 3:150")
// → { ref: "1 Nephi 3:150", verse_ids: [...], canon: "coc" }

// Explicit COC, found in COC → no canon field
lookupReference("1 Nephi 3:150", "en", { canon: "coc" })
// → { ref: "1 Nephi 3:150", verse_ids: [...] }
```

## File Structure

```
src/
├── scriptures.mjs              # Main entry (updated imports)
├── canon-converter.mjs         # Renamed from scriptcanon.mjs
├── lib/
│   ├── data-loader.mjs         # NEW: lazy loading, caching, merging
│   ├── deep-merge.mjs          # KEEP: merges shared + canon data
│   └── options-resolver.mjs    # KEEP: resolves language/canon options
├── data/                       # Compiled JS (gitignored)
│   ├── canons/
│   │   ├── bible/
│   │   │   ├── structure.mjs
│   │   │   └── en.mjs
│   │   ├── lds/
│   │   │   ├── structure.mjs
│   │   │   └── en.mjs
│   │   └── coc/
│   │       ├── structure.mjs
│   │       ├── en.mjs
│   │       └── mapping.mjs
│   └── shared/
│       ├── en.mjs
│       └── ko.mjs

build/
├── build.mjs                   # Existing bundler
└── compile-yaml.mjs            # NEW: YAML → JS compiler

data/                           # Source YAML (committed)
├── canons/
│   ├── bible/
│   │   ├── _structure.yml
│   │   └── en.yml
│   ├── lds/
│   │   ├── _structure.yml
│   │   └── en.yml
│   └── coc/
│       ├── _structure.yml
│       └── en.yml
└── shared/
    ├── en.yml
    └── ko.yml
```

## Files to Delete

After refactoring is complete, remove from `src/lib/`:
- `yaml-loader.mjs` (only needed by build script, move to `build/`)
- `canon-loader.mjs` (replaced by `data-loader.mjs`)

## Implementation Tasks

1. Create `build/compile-yaml.mjs` script
2. Create `src/lib/data-loader.mjs` module
3. Update `src/scriptures.mjs` to use data-loader
4. Rename `scriptcanon.mjs` to `canon-converter.mjs`, make generic
5. Add `canon` option to lookup/generate/detect functions
6. Add `setCanon()`/`getCanon()` functions
7. Implement auto-detect fallback logic
8. Update `build/build.mjs` to run compile-yaml first
9. Add `src/data/` to `.gitignore`
10. Update tests for new canon functionality
11. Move `yaml-loader.mjs` to `build/` directory
12. Remove `canon-loader.mjs`

## Testing Strategy

- All existing tests must pass (backward compatibility)
- Add tests for explicit canon selection
- Add tests for auto-detect fallback
- Add tests for `convertCanon()` with lazy loading
- Add tests for `setCanon()`/`getCanon()`
