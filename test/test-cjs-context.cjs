// test-cjs-context.cjs
// This file tests CommonJS imports in a proper CommonJS context

console.log('Testing CommonJS import in CommonJS context...');

try {
    // This should fail with ERR_REQUIRE_ESM error
    const scriptureGuide = require('../scriptures.cjs');
    console.log('✅ CommonJS import successful');
    
    // Test basic functionality
    const result = scriptureGuide.lookupReference('John 3:16');
    console.log('✅ Basic functionality test:', result);
    
} catch (error) {
    console.error('❌ CommonJS import failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Stack trace:', error.stack);
    
    if (error.code === 'ERR_REQUIRE_ESM') {
        console.log('\n🔍 This is the exact error your customer is experiencing!');
        console.log('The CommonJS build is trying to require() ES modules from ./data/ directory');
        console.log('\nSolution needed: Convert data files to CommonJS format or use dynamic imports');
    }
}
