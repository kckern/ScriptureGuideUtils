import { loadYaml } from './yaml-loader.mjs';
import { join } from 'path';

const DATA_DIR = 'data';

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
