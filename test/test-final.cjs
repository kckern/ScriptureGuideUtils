// test-final.cjs
console.log('Testing final CommonJS build...');

try {
    const { lookupReference, generateReference } = require('./scriptures.cjs');
    
    const result1 = lookupReference('John 3:16');
    console.log('✅ CommonJS lookup works:', result1);
    
    const result2 = generateReference([1, 2, 3]);
    console.log('✅ CommonJS generate works:', result2);
    
    console.log('🎉 CommonJS is working perfectly!');
} catch (error) {
    console.error('❌ CommonJS failed:', error.message);
}
