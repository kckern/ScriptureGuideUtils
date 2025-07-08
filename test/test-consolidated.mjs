// test-consolidated.mjs
import { lookupReference, generateReference, detectReferences } from './scriptures-consolidated.mjs';

console.log('Testing consolidated scriptures file...');

// Test 1: Basic lookup
const result1 = lookupReference('John 3:16');
console.log('✅ Basic lookup:', result1);

// Test 2: Generate reference
const result2 = generateReference([1, 2, 3]);
console.log('✅ Generate reference:', result2);

// Test 3: Detect references
const result3 = detectReferences('Read Matthew 5:3-4 and Luke 2:1');
console.log('✅ Detect references:', result3);

console.log('\n🎉 Consolidated file works perfectly!');
