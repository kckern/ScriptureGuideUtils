// test-customer-scenario.cjs
// This simulates the exact scenario your customer is experiencing

console.log('🧪 Testing customer scenario: CommonJS require() in Node.js environment');
console.log('This simulates a TypeScript project using ts-node and CommonJS imports\n');

// Test 1: Direct CommonJS require (what your customer is doing)
console.log('Test 1: Direct CommonJS require()');
try {
    const scriptureGuide = require('../scriptures.cjs');
    console.log('✅ CommonJS require() successful');
    
    // Test core functionality
    const result1 = scriptureGuide.lookupReference('1 Nephi 3:7');
    console.log('✅ lookupReference test:', result1);
    
    const result2 = scriptureGuide.generateReference([1, 2, 3]);
    console.log('✅ generateReference test:', result2);
    
    const result3 = scriptureGuide.detectReferences('Read John 3:16 and Matthew 5:3-4', (ref) => `<a href="#">${ref}</a>`);
    console.log('✅ detectReferences test:', result3);
    
    console.log('\n🎉 All CommonJS functionality tests passed!');
    
} catch (error) {
    console.error('❌ CommonJS require() failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'ERR_REQUIRE_ESM') {
        console.log('\n❗ This is the error your customer was experiencing!');
        console.log('   The issue was that CommonJS build was trying to require() ES modules');
    }
}

// Test 2: Package.json exports field (what Node.js module resolution does)
console.log('\nTest 2: Testing package.json exports field');
try {
    // This should automatically pick the right version based on import vs require
    const scriptureGuide = require('scripture-guide');  // This uses the package.json exports
    console.log('✅ Package.json exports working for CommonJS');
    
    const result = scriptureGuide.lookupReference('Doctrine and Covenants 76:22-24');
    console.log('✅ Package.json exports functionality test:', result);
    
} catch (error) {
    console.error('❌ Package.json exports failed:', error.message);
    console.log('   Note: This test requires the package to be installed globally or linked');
    console.log('   Run: npm link (in this directory) then npm link scripture-guide');
}

console.log('\n🏁 Customer scenario test complete!');
