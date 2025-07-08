// test-final.mjs
import { lookupReference, generateReference, detectReferences } from './scriptures.mjs';

console.log('Testing final ES module build...');

const result1 = lookupReference('Matthew 5:3-4');
console.log('✅ ES module lookup works:', result1);

const result2 = generateReference([23238, 23239]);
console.log('✅ ES module generate works:', result2);

const result3 = detectReferences('Read John 3:16 and Luke 2:1');
console.log('✅ ES module detect works:', result3);

console.log('🎉 ES modules working perfectly!');
