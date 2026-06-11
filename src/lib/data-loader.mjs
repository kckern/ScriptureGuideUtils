/**
 * Data loader - provides legacy-compatible data format from compiled YAML
 *
 * Exports:
 *   - scriptData: { "Genesis": [31, 25, ...], ... }
 *   - regexData: { books: [...], pre_rules: [...], joiners: [...], ... }
 *   - langData: { ko: {...}, de: {...}, ... }
 */

// Eagerly load structures
import bibleStructure from '../data/canons/bible/structure.mjs';
import ldsStructure from '../data/canons/lds/structure.mjs';

// Eagerly load English book data
import bibleEn from '../data/canons/bible/en.mjs';
import ldsEn from '../data/canons/lds/en.mjs';

// Eagerly load shared language config
import sharedEn from '../data/shared/en.mjs';

// Eagerly load all language files for bible canon
import bibleKo from '../data/canons/bible/ko.mjs';
import bibleDe from '../data/canons/bible/de.mjs';
import bibleFr from '../data/canons/bible/fr.mjs';
import bibleRu from '../data/canons/bible/ru.mjs';
import bibleJp from '../data/canons/bible/jp.mjs';
import bibleVn from '../data/canons/bible/vn.mjs';
import bibleTr from '../data/canons/bible/tr.mjs';
import bibleSwe from '../data/canons/bible/swe.mjs';
import bibleTgl from '../data/canons/bible/tgl.mjs';
import bibleSlv from '../data/canons/bible/slv.mjs';
import bibleEo from '../data/canons/bible/eo.mjs';

// Load LDS-specific language files
import ldsKo from '../data/canons/lds/ko.mjs';
import ldsDe from '../data/canons/lds/de.mjs';
import ldsFr from '../data/canons/lds/fr.mjs';
import ldsRu from '../data/canons/lds/ru.mjs';
import ldsJp from '../data/canons/lds/jp.mjs';
import ldsVn from '../data/canons/lds/vn.mjs';
import ldsTr from '../data/canons/lds/tr.mjs';
import ldsSwe from '../data/canons/lds/swe.mjs';
import ldsTgl from '../data/canons/lds/tgl.mjs';
import ldsSlv from '../data/canons/lds/slv.mjs';
import ldsEo from '../data/canons/lds/eo.mjs';

// Load shared language configs
import sharedKo from '../data/shared/ko.mjs';

// Merge bible + lds structures
const allBooks = [...bibleStructure.books, ...ldsStructure.books];
const allBooksEn = { ...bibleEn.books, ...ldsEn.books };

/**
 * Build script data: { "BookName": [verses_per_chapter], ... }
 */
function buildScriptData() {
  const result = {};
  for (const book of allBooks) {
    const bookInfo = allBooksEn[book.key];
    const displayName = bookInfo?.name || book.key;
    result[displayName] = book.verses;
  }
  return result;
}

/**
 * Build regex data: { books: [[pattern, name], ...], pre_rules, post_rules, joiners }
 */
function buildRegexData() {
  const books = [];

  for (const [key, bookInfo] of Object.entries(allBooksEn)) {
    const name = bookInfo.name;

    // Check if book name has a number prefix (e.g., "1 Corinthians", "2 Samuel")
    const numberMatch = name.match(/^(\d+)\s+(.+)$/);
    const numberPrefix = numberMatch ? numberMatch[1] + '\\s*' : '';

    // Add regex pattern (with number prefix for numbered books)
    if (bookInfo.pattern) {
      const fullPattern = numberPrefix + bookInfo.pattern;
      books.push([fullPattern, name]);
    }
    // Add name itself (case-insensitive via the regex engine)
    books.push([name, name]);
    // Add alternates
    if (bookInfo.alt) {
      for (const alt of bookInfo.alt) {
        books.push([alt, name]);
      }
    }
  }

  return {
    books,
    pre_rules: sharedEn.pre_rules || [],
    post_rules: sharedEn.post_rules || [],
    joiners: sharedEn.joiners || []
  };
}

/**
 * Transform YAML book format to legacy format
 * YAML: { genesis: { name: "창세기", alt: ["창"] } }
 * Legacy: { "창세기": ["창"] }
 */
function transformBooks(bibleBooks, ldsBooks) {
  const result = {};
  const allBooks = { ...bibleBooks.books, ...ldsBooks.books };

  for (const [key, bookInfo] of Object.entries(allBooks)) {
    const name = bookInfo.name;
    // Legacy format: book name → array of alternates (including pattern matches)
    const alts = bookInfo.alt || [];
    result[name] = alts;
  }

  return result;
}

/**
 * Build language data: { langCode: { books: {...}, pre_rules, ... }, ... }
 * Books format: { "BookName": ["alt1", "alt2"], ... }
 */
function buildLangData() {
  return {
    ko: {
      books: transformBooks(bibleKo, ldsKo),
      pre_rules: sharedKo.pre_rules,
      post_rules: sharedKo.post_rules,
      joiners: sharedKo.joiners,
      spacing: sharedKo.spacing,
      wordBreak: sharedKo.wordBreak || ''
    },
    de: {
      books: transformBooks(bibleDe, ldsDe),
      pre_rules: sharedEn.pre_rules,
      post_rules: sharedEn.post_rules,
      joiners: sharedEn.joiners
    },
    fr: {
      books: transformBooks(bibleFr, ldsFr),
      pre_rules: sharedEn.pre_rules,
      post_rules: sharedEn.post_rules,
      joiners: sharedEn.joiners
    },
    ru: {
      books: transformBooks(bibleRu, ldsRu),
      pre_rules: sharedEn.pre_rules,
      post_rules: sharedEn.post_rules,
      joiners: sharedEn.joiners
    },
    jp: {
      books: transformBooks(bibleJp, ldsJp),
      pre_rules: sharedEn.pre_rules,
      post_rules: sharedEn.post_rules,
      joiners: sharedEn.joiners,
      wordBreak: ''
    },
    vn: {
      books: transformBooks(bibleVn, ldsVn),
      pre_rules: sharedEn.pre_rules,
      post_rules: sharedEn.post_rules,
      joiners: sharedEn.joiners
    },
    tr: {
      books: transformBooks(bibleTr, ldsTr),
      pre_rules: sharedEn.pre_rules,
      post_rules: sharedEn.post_rules,
      joiners: sharedEn.joiners
    },
    swe: {
      books: transformBooks(bibleSwe, ldsSwe),
      pre_rules: sharedEn.pre_rules,
      post_rules: sharedEn.post_rules,
      joiners: sharedEn.joiners
    },
    tgl: {
      books: transformBooks(bibleTgl, ldsTgl),
      pre_rules: sharedEn.pre_rules,
      post_rules: sharedEn.post_rules,
      joiners: sharedEn.joiners
    },
    slv: {
      books: transformBooks(bibleSlv, ldsSlv),
      pre_rules: sharedEn.pre_rules,
      post_rules: sharedEn.post_rules,
      joiners: sharedEn.joiners
    },
    eo: {
      books: transformBooks(bibleEo, ldsEo),
      pre_rules: sharedEn.pre_rules,
      post_rules: sharedEn.post_rules,
      joiners: sharedEn.joiners
    }
  };
}

// Export pre-built data
export const scriptData = buildScriptData();
export const regexData = buildRegexData();
export const langData = buildLangData();

// Also export structures for advanced use
export { bibleStructure, ldsStructure };
