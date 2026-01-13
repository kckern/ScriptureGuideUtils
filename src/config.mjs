/**
 * Configuration constants for scripture-guide
 */

// Safety limits
export const MAX_RANGE_SIZE = 1000;
export const MAX_CHAPTER = 200;
export const MAX_VERSE = 200;
export const MAX_QUERY_LENGTH = 500;

// Canon identifiers
export const CANON_LDS = 'lds';
export const CANON_COC = 'coc';

// Verse ID format patterns
export const COC_ID_PATTERN = /^C\d+$/;
export const LDS_ID_PATTERN = /^\d+$/;

// Language fallback order
export const LANGUAGE_FALLBACK = ['en', 'es', 'fr', 'de', 'ko', 'ja', 'zh'];

// Default settings
export const DEFAULTS = {
  language: 'en',
  canon: CANON_LDS,
  contextAware: false
};
