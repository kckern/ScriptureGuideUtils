// test/test-scriptcanon.js
import { detectCanon, formatCocId, parseCocId } from '../src/scriptcanon.mjs';
import cocMapping from '../data/coc-mapping.mjs';

const tests = [];
const test = (name, fn) => tests.push({ name, fn });
const run = () => {
  let passed = 0, failed = 0;
  for (const t of tests) {
    try {
      t.fn();
      console.log(`✓ ${t.name}`);
      passed++;
    } catch (e) {
      console.log(`✗ ${t.name}: ${e.message}`);
      failed++;
    }
  }
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
};

// detectCanon tests
test('detectCanon returns "coc" for C-prefixed string', () => {
  if (detectCanon('C00001') !== 'coc') throw new Error('Expected coc');
});

test('detectCanon returns "lds" for integer', () => {
  if (detectCanon(31103) !== 'lds') throw new Error('Expected lds');
});

test('detectCanon returns "lds" for numeric string', () => {
  if (detectCanon('31103') !== 'lds') throw new Error('Expected lds');
});

test('detectCanon returns null for invalid input', () => {
  if (detectCanon('invalid') !== null) throw new Error('Expected null');
});

// formatCocId tests
test('formatCocId pads to 5 digits', () => {
  if (formatCocId(1) !== 'C00001') throw new Error('Expected C00001');
  if (formatCocId(50) !== 'C00050') throw new Error('Expected C00050');
  if (formatCocId(6839) !== 'C06839') throw new Error('Expected C06839');
});

// parseCocId tests
test('parseCocId extracts number', () => {
  if (parseCocId('C00001') !== 1) throw new Error('Expected 1');
  if (parseCocId('C00050') !== 50) throw new Error('Expected 50');
  if (parseCocId('C06839') !== 6839) throw new Error('Expected 6839');
});

// coc-mapping tests
test('coc-mapping has cocToLds object', () => {
  if (typeof cocMapping.cocToLds !== 'object') throw new Error('Missing cocToLds');
});

test('coc-mapping has ldsToCoc object', () => {
  if (typeof cocMapping.ldsToCoc !== 'object') throw new Error('Missing ldsToCoc');
});

test('coc-mapping sample entry exists', () => {
  if (!cocMapping.cocToLds[1]) throw new Error('Missing entry for COC verse 1');
});

run();
