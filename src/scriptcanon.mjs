// src/scriptcanon.mjs
import cocMapping from '../data/coc-mapping.mjs';

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

/**
 * Convert COC verse_ids to LDS verse_ids
 * @param {string[]} cocIds - Array of COC ids like ['C00001', 'C00002']
 * @returns {{ verse_ids: number[], partial: boolean }}
 */
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

/**
 * Convert LDS verse_ids to COC verse_ids
 * @param {number[]} ldsIds - Array of LDS verse_ids
 * @returns {{ verse_ids: string[], partial: boolean }}
 */
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
