// test-both-modules.mjs
// Test both ES modules and CommonJS imports

console.log('Testing both ES modules and CommonJS imports...');

// Test ES module import
try {
    const { lookupReference } = await import('../scriptures.mjs');
    const result = lookupReference('Matthew 5:3-4');
    console.log('✅ ES Module import successful:', result);
} catch (error) {
    console.error('❌ ES Module import failed:', error.message);
}

// Test CommonJS require (using dynamic import to simulate)
try {
    const scriptureGuide = await import('../scriptures.cjs');
    const result = scriptureGuide.lookupReference('Luke 2:1');
    console.log('✅ CommonJS import via dynamic import successful:', result);
} catch (error) {
    console.error('❌ CommonJS import failed:', error.message);
}
