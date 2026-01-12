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
