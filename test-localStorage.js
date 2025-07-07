import { lookupReference, generateReference, detectReferences, setLanguage } from './scriptures.js';

// Simulate browser localStorage for testing
global.localStorage = {
    storage: {},
    getItem: function(key) {
        return this.storage[key] || null;
    },
    setItem: function(key, value) {
        this.storage[key] = value;
    },
    removeItem: function(key) {
        delete this.storage[key];
    }
};

console.log('Testing localStorage integration:');

// Test 1: Without setLanguage, should default to English
console.log('\n1. Default behavior (no language set):');
const result1 = lookupReference("Genesis 1:1");
console.log('Genesis 1:1 (default):', result1);

// Test 2: Set language to Korean
console.log('\n2. Set language to Korean:');
setLanguage('ko');
const result2 = lookupReference("창세기 1:1");
console.log('창세기 1:1 (after setLanguage ko):', result2);

// Test 3: Next call should use Korean from localStorage
console.log('\n3. Next call should use Korean from localStorage:');
const result3 = lookupReference("창세기 1:2");
console.log('창세기 1:2 (should use stored Korean):', result3);

// Test 4: Explicit language should override stored language
console.log('\n4. Explicit language overrides stored language:');
const result4 = lookupReference("Genèse 1:1", "fr");
console.log('Genèse 1:1 (explicit French):', result4);

// Test 5: generateReference should use stored language
console.log('\n5. generateReference should use stored language:');
const generated = generateReference([1, 2, 3]);
console.log('Generated reference (should be Korean):', generated);

// Test 6: generateReference with explicit language
console.log('\n6. generateReference with explicit language:');
const generated2 = generateReference([1, 2, 3], 'fr');
console.log('Generated reference (explicit French):', generated2);

// Test 7: Check localStorage contents
console.log('\n7. Check localStorage contents:');
console.log('Stored language:', global.localStorage.getItem('scriptureGuideUtils_language'));

// Test 8: Set language to null (should clear localStorage)
console.log('\n8. Set language to null:');
setLanguage(null);
console.log('Stored language after setting to null:', global.localStorage.getItem('scriptureGuideUtils_language'));

// Test 9: Should default to English again
console.log('\n9. Should default to English again:');
const result9 = lookupReference("Genesis 1:1");
const generated9 = generateReference([1]);
console.log('Genesis 1:1 (after clearing):', result9);
console.log('Generated reference (after clearing):', generated9);
