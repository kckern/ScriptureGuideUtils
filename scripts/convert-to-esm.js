#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the CommonJS version
const cjsPath = path.join(__dirname, '..', 'scriptures-compiled.cjs');
const esmPath = path.join(__dirname, '..', 'scriptures-esm.js');

let content = fs.readFileSync(cjsPath, 'utf8');

// Convert CommonJS to ES modules
content = content.replace('"use strict";\n\n', '');

// Remove CommonJS exports setup
content = content.replace(/Object\.defineProperty\(exports, "__esModule", \{\s*value: true\s*\}\);\s*/, '');
content = content.replace(/exports\.[^=]*= void 0;\s*/, '');

// Replace require statements with import statements
content = content.replace(/var (_\w+) = _interopRequireDefault\(require\("([^"]+)"\)\);/g, 'import $1 from "$2";');
content = content.replace(/var (_\w+) = require\("([^"]+)"\);/g, 'import $1 from "$2";');

// Remove _interopRequireDefault function
content = content.replace(/function _interopRequireDefault\(obj\) \{ return obj && obj\.__esModule \? obj : \{ "default": obj \}; \}\s*/, '');

// Replace _scriptdata["default"] patterns
content = content.replace(/_scriptdata\["default"\]/g, '_scriptdata');
content = content.replace(/_scriptregex\["default"\]/g, '_scriptregex');
content = content.replace(/_scriptlang\["default"\]/g, '_scriptlang');

// Replace exports patterns
content = content.replace(/var (\w+) = exports\.[^=]*= function/g, 'var $1 = function');

// Add ES module exports at the end
const exports = `
// ES Module exports
export {
  detectReferences as detect,
  detectReferences,
  detectReferences as detectRefs,
  detectReferences as detectScriptureReferences,
  detectReferences as detectScriptures,
  detectReferences as linkRefs,
  generateReference as generate,
  generateReference as gen,
  generateReference,
  setLanguage as lang,
  setLanguage as language,
  setLanguage as setLang,
  setLanguage,
  lookupReference as lookup,
  lookupReference,
  lookupReference as parse,
  lookupReference as read,
  generateReference as ref,
  lookupReference as ref2VerseId,
  generateReference as verseId2Ref
};
`;

content = content + exports;

// Write the ES module version
fs.writeFileSync(esmPath, content);

console.log('ES module version generated successfully');
