import { lookupReference, generateReference, detectReferences } from './scriptures.js';

// Test English (default)
console.log('Testing English:');
const result1 = lookupReference("Genesis 1:1");
console.log('Genesis 1:1 (English):', result1);

// Test Korean
console.log('\nTesting Korean:');
const result2 = lookupReference("창세기 1:1", "ko");
console.log('창세기 1:1 (Korean):', result2);

// Test French
console.log('\nTesting French:');
const result3 = lookupReference("Genèse 1:1", "fr");
console.log('Genèse 1:1 (French):', result3);

// Test invalid language (should fallback to English)
console.log('\nTesting invalid language:');
const result4 = lookupReference("Genesis 1:1", "invalid");
console.log('Genesis 1:1 (invalid language):', result4);

// Test generating reference with language
console.log('\nTesting generateReference with Korean:');
const generated = generateReference([1], "ko");
console.log('Generated Korean reference:', generated);

// Test detect references with language
console.log('\nTesting detectReferences with Korean:');
const detected = detectReferences("창세기 1:1에서 말씀하시기를", undefined, "ko");
console.log('Detected Korean references:', detected);
