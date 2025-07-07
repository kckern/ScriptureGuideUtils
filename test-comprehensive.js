import { lookupReference, generateReference, detectReferences } from './scriptures.js';

// Test fallback behavior
console.log('Testing fallback behavior:');

// Test Korean input with Korean language
const korean1 = lookupReference("창세기 1:1", "ko");
console.log('Korean input with Korean language:', korean1);

// Test English input with Korean language (should fallback)
const korean2 = lookupReference("Genesis 1:1", "ko");
console.log('English input with Korean language (fallback):', korean2);

// Test non-existent reference in Korean
const korean3 = lookupReference("잘못된 참조", "ko");
console.log('Invalid Korean reference:', korean3);

// Test concurrent usage simulation
console.log('\nTesting concurrent usage:');
const session1 = lookupReference("창세기 1:1", "ko");
const session2 = lookupReference("Genèse 1:1", "fr");
const session3 = lookupReference("Genesis 1:1", "en");

console.log('Session 1 (Korean):', session1);
console.log('Session 2 (French):', session2);
console.log('Session 3 (English):', session3);

// Test generate reference with different languages
console.log('\nTesting generateReference with different languages:');
console.log('English:', generateReference([1], "en"));
console.log('Korean:', generateReference([1], "ko"));
console.log('French:', generateReference([1], "fr"));
console.log('German:', generateReference([1], "de"));

// Test detect references
console.log('\nTesting detectReferences:');
const koreanText = "창세기 1:1과 출애굽기 20:3을 읽어보세요.";
const detected = detectReferences(koreanText, undefined, "ko");
console.log('Korean text detection:', detected);
