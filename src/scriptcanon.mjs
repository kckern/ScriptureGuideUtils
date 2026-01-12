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
