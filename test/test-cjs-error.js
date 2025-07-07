#!/usr/bin/env node

// Test script to replicate the CommonJS import error
// This simulates what your customer is experiencing

console.log('Testing CommonJS import of scripture-guide...');

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
    
    if (error.code === 'ERR_REQUIRE_ESM') {
        console.log('\n🔍 This is the exact error your customer is experiencing!');
        console.log('The CommonJS build is trying to require() ES modules from ./data/ directory');
    }
}

console.log('\n--- Testing ES Module import for comparison ---');

try {
    // This should work
    import('../scriptures.mjs').then(scriptureGuide => {
        console.log('✅ ES Module import successful');
        const result = scriptureGuide.lookupReference('John 3:16');
        console.log('✅ ES Module functionality test:', result);
    }).catch(err => {
        console.error('❌ ES Module import failed:', err.message);
    });
} catch (error) {
    console.error('❌ ES Module import failed:', error.message);
}
