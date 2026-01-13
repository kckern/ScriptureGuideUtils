import { loadYaml } from './yaml-loader.mjs';
import { join } from 'path';

const DATA_DIR = 'data';

// Cache for loaded canons
const canonCache = new Map();

/**
 * Load shared language patterns
 * @param {string} langCode - Language code (e.g., 'en')
 * @returns {Object|null} Shared language config or null
 */
export function loadSharedLanguage(langCode) {
  const path = join(DATA_DIR, 'shared', `${langCode}.yml`);
  return loadYaml(path);
}

/**
 * Load canon structure (books, chapters, verse IDs)
 * @param {string} canonName - Canon name (e.g., 'bible', 'lds')
 * @returns {Object|null} Canon structure or null
 */
export function loadCanonStructure(canonName) {
  const path = join(DATA_DIR, 'canons', canonName, '_structure.yml');
  return loadYaml(path);
}

/**
 * Load canon with inheritance resolution
 * @param {string} canonName - Canon name
 * @returns {Object|null} Merged canon structure
 */
export function loadCanonWithInheritance(canonName) {
  if (canonCache.has(canonName)) {
    return canonCache.get(canonName);
  }

  const structure = loadCanonStructure(canonName);
  if (!structure) return null;

  let merged = { ...structure };

  // If extends parent, load and merge parent first
  if (structure.extends) {
    const parent = loadCanonWithInheritance(structure.extends);
    if (parent) {
      merged = {
        ...structure,
        books: [...parent.books, ...structure.books],
        _parent: structure.extends
      };
    }
  }

  canonCache.set(canonName, merged);
  return merged;
}

/**
 * Clear canon cache (for testing)
 */
export function clearCanonCache() {
  canonCache.clear();
}
