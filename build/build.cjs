#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('Creating browser-compatible scriptures.mjs with embedded data...');

// Read all the data files and extract their content
const scriptdata = fs.readFileSync(path.join(__dirname, '../data/scriptdata.mjs'), 'utf8')
    .replace(/^export default\s+/, '').replace(/;\s*$/, '');

const scriptregex = fs.readFileSync(path.join(__dirname, '../data/scriptregex.mjs'), 'utf8')
    .replace(/^export default\s+/, '').replace(/;\s*$/, '');

const scriptlang = fs.readFileSync(path.join(__dirname, '../data/scriptlang.mjs'), 'utf8')
    .replace(/^export default\s+/, '').replace(/;\s*$/, '');

// Get the processReferenceDetection function
const scriptdetect = fs.readFileSync(path.join(__dirname, '../src/scriptdetect.mjs'), 'utf8');

// Extract the entire file content and remove exports
const processReferenceDetectionCode = scriptdetect
    .replace(/export\s*\{[\s\S]*?\}/, '')
    .trim();

// Read the original scriptures file
const originalContent = fs.readFileSync(path.join(__dirname, '../src/scriptures.mjs'), 'utf8');

// Replace imports with embedded data
const updatedContent = originalContent
    .replace(/import raw_index_orig from '\.\.\/data\/scriptdata\.mjs';\s*/, 
             `const raw_index_orig = ${scriptdata};\n`)
    .replace(/import raw_regex_orig from '\.\.\/data\/scriptregex\.mjs';\s*/, 
             `const raw_regex_orig = ${scriptregex};\n`)
    .replace(/import raw_lang from '\.\.\/data\/scriptlang\.mjs';\s*/, 
             `const raw_lang = ${scriptlang};\n`)
    .replace(/import { processReferenceDetection } from '\.\/scriptdetect\.mjs';\s*/, 
             `${processReferenceDetectionCode}\n`);

// Write the updated file
fs.writeFileSync(path.join(__dirname, '../dist/scriptures.mjs'), updatedContent);

console.log('✅ Updated scriptures.mjs with embedded data');

// Create CommonJS version with embedded data
console.log('Creating CommonJS version with embedded data...');

// Create CommonJS version with proper module.exports
const cjsContent = updatedContent
    // Remove export statements and replace with module.exports
    .replace(/export\s*\{[\s\S]*?\};?\s*$/, '')
    .replace(/export\s+/g, '')
    // Add module.exports at the end
    + `

// CommonJS exports
module.exports = {
    setLanguage,
    setLang: setLanguage,
    language: setLanguage,
    lang: setLanguage,
    lookupReference,
    lookup: lookupReference,
    parse: lookupReference,
    read: lookupReference,
    ref2VerseId: lookupReference,
    generateReference,
    generate: generateReference,
    gen: generateReference,
    ref: generateReference,
    verseId2Ref: generateReference,
    detectReferences,
    detect: detectReferences,
    detectRefs: detectReferences,
    detectScriptureReferences: detectReferences,
    detectScriptures: detectReferences,
    linkRefs: detectReferences
};
`;

// Write the CommonJS file
fs.writeFileSync(path.join(__dirname, '../dist/scriptures.cjs'), cjsContent);

console.log('✅ Updated scriptures.cjs with embedded data');
console.log('✅ Now works in browsers, Node.js, and bundlers without external dependencies!');
