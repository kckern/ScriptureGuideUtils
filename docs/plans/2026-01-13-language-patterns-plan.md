# Plan: Generate Missing Language Patterns

## Goal
Add regex patterns to language files that currently have 0% or partial pattern coverage, following the established pattern conventions.

## Pattern Strategy
For each language, generate patterns that handle:
1. **Case insensitivity** - `[Gg]enesis` style for languages with case
2. **Diacritic tolerance** - `[éè]` alternations for accented characters
3. **Optional suffixes** - `book*` for optional word endings
4. **Spacing flexibility** - `[ -]*` for optional spaces/hyphens

## Tasks

### Batch 1: Japanese (jp)
- [ ] Add patterns for Bible books (66 books)
- [ ] Add patterns for LDS books (21 books)
- [ ] Verify YAML validity

### Batch 2: Swedish (swe)
- [ ] Add patterns for Bible books (66 books)
- [ ] Add patterns for LDS books (21 books)
- [ ] Verify YAML validity

### Batch 3: Tagalog (tgl)
- [ ] Add patterns for Bible books (66 books)
- [ ] Add patterns for LDS books (21 books)
- [ ] Verify YAML validity

### Batch 4: Turkish (tr)
- [ ] Add patterns for Bible books (66 books)
- [ ] Add patterns for LDS books (21 books)
- [ ] Verify YAML validity

### Batch 5: Slovenian (slv)
- [ ] Add patterns for Bible books (66 books)
- [ ] Add patterns for LDS books (21 books)
- [ ] Verify YAML validity

### Batch 6: Esperanto (eo)
- [ ] Add patterns for Bible books (66 books)
- [ ] Add patterns for LDS books (21 books)
- [ ] Verify YAML validity

### Batch 7: Fill gaps in partial-coverage languages
- [ ] German (de): Add patterns for remaining 82 books
- [ ] French (fr): Add patterns for remaining 43 books
- [ ] Korean (ko): Add patterns for remaining 60 books
- [ ] Verify all YAML files

### Batch 8: Final verification
- [ ] Run pattern coverage audit
- [ ] Verify all 22 language files load correctly
- [ ] Run existing tests to ensure no regressions

## Verification
After each batch: `node -e "..." ` to validate YAML and count patterns
