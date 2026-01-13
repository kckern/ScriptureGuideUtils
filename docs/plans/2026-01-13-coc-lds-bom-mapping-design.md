# COC↔LDS Book of Mormon Mapping Design

**Date:** 2026-01-13
**Status:** Ready for implementation

## Summary

Add COC (Community of Christ) Book of Mormon ↔ LDS Book of Mormon verse mapping to the existing RLDS `_mapping.yml` file, using the same compressed format as the JST↔Bible mapping.

## Background

- COC/RLDS uses 1830 chapter divisions (fewer chapters, more verses per chapter)
- LDS uses Orson Pratt's 1879 reformatted versification
- Existing data: `_archive/data/coc-mapping.mjs` contains verse-level alignments generated via text similarity

## File Structure

**Location:** `data/canons/rlds/_mapping.yml`

```yaml
# Maps TO Bible canon (JST ↔ KJV) - existing
bible:
  runs: [...]
  singles: [...]
  multi: [...]

# Maps TO LDS canon (COC BOM ↔ LDS BOM) - new
lds:
  runs: [...]
  singles: [...]
  multi: [...]
```

## Format Specification

### ID Ranges

- **COC BOM IDs:** 31334–39975 (global RLDS IDs, continuing from JST)
- **LDS BOM IDs:** 31103–37706 (from `_lds.yml`)

### Compression Format

```yaml
lds:
  # Sequential 1:1 runs: [coc_start, lds_start, length]
  runs:
    - [31334, 31103, 8]  # COC verses 31334-31341 → LDS 31103-31110

  # Isolated 1:1 mappings
  singles:
    - [coc_id, lds_id]

  # One COC verse → multiple LDS verses
  multi:
    - [31342, [31112, 31113]]  # COC 31342 → LDS 31112 + 31113
```

## Implementation

### Script: `build/generate-coc-mapping-yaml.cjs`

**Steps:**
1. Parse `_archive/data/coc-mapping.mjs` to extract `cocToLds` mappings
2. Convert COC BOM-relative IDs (1-based) to global RLDS IDs (+31333 offset)
3. Identify sequential runs where `coc[n]→lds[m]` and `coc[n+1]→lds[m+1]`
4. Extract multi-mappings (entries with `partial: true` and multiple LDS IDs)
5. Collect remaining 1:1 mappings as singles
6. Read existing `_mapping.yml`, add `lds:` section, write back

### Validation

- Total COC verses matches sum of BOM book verses in `_rlds.yml`
- All LDS BOM IDs (31103-37706) are reachable
- No orphaned mappings

## Estimated Output

- **Runs:** ~200-400 entries
- **Singles:** ~100-300 entries
- **Multi:** ~200-500 entries
- **File size increase:** ~30-50KB

## Source Data

- PDF cross-reference: `_archive/BofM_RLDS-LDSCrossReference.pdf`
- Generated mapping: `_archive/data/coc-mapping.mjs` (76K lines, text-similarity aligned)
- Generator: `build/generate-coc-mapping.cjs`
