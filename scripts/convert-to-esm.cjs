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
content = content.replace(/Object\.defineProperty\(exports, "__esModule", \{\s*value: true\s*\}\);\s*\n/g, '');
content = content.replace(/exports\.[^=]*= void 0;\s*\n/g, '');

// Replace require statements with import statements
content = content.replace(/var (_scriptdata) = _interopRequireDefault\(require\("\.\/data\/scriptdata\.js"\)\);/g, 'import $1 from "./data/scriptdata.js";');
content = content.replace(/var (_scriptregex) = _interopRequireDefault\(require\("\.\/data\/scriptregex\.js"\)\);/g, 'import $1 from "./data/scriptregex.js";');
content = content.replace(/var (_scriptlang) = _interopRequireDefault\(require\("\.\/data\/scriptlang\.js"\)\);/g, 'import $1 from "./data/scriptlang.js";');
content = content.replace(/var (_scriptdetect) = require\("\.\/data\/scriptdetect\.js"\);/g, 'import { processReferenceDetection } from "./data/scriptdetect.js";');

// Remove _interopRequireDefault function
content = content.replace(/function _interopRequireDefault\(obj\) \{ return obj && obj\.__esModule \? obj : \{ "default": obj \}; \}\s*\n/g, '');

// Replace _scriptdata["default"] patterns
content = content.replace(/_scriptdata\["default"\]/g, '_scriptdata');
content = content.replace(/_scriptregex\["default"\]/g, '_scriptregex');
content = content.replace(/_scriptlang\["default"\]/g, '_scriptlang');

// Replace exports patterns for function declarations
content = content.replace(/var (setLanguage) = exports\.setLang = exports\.language = exports\.lang = exports\.setLanguage = function/g, 'var $1 = function');
content = content.replace(/var (lookupReference) = exports\.ref2VerseId = exports\.read = exports\.parse = exports\.lookup = exports\.lookupReference = function/g, 'var $1 = function');
content = content.replace(/var (generateReference) = exports\.verseId2Ref = exports\.generate = exports\.gen = exports\.ref = exports\.generateReference = function/g, 'var $1 = function');
content = content.replace(/var (detectReferences) = exports\.linkRefs = exports\.detectScriptures = exports\.detectRefs = exports\.detectScriptureReferences = exports\.detect = exports\.detectReferences = function/g, 'var $1 = function');

// Add ES module exports at the end
const exportStatements = `
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

content = content + exportStatements;

// Write the ES module version
fs.writeFileSync(esmPath, content);

console.log('ES module version generated successfully');
