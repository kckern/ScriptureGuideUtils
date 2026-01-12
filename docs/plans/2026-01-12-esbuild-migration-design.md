# Build System Migration: Custom Bundler to esbuild

## Problem

The current `build/build.cjs` is a custom bundler with multiple antipatterns:
- Fragile regex-based code transformation
- No AST parsing (breaks on edge cases)
- No error handling
- Hardcoded export list that can drift
- No source maps
- No build validation

## Solution

Replace with esbuild, a proper bundler designed for this use case.

## Implementation

### 1. Create new build script

**File:** `build/build.mjs`

```javascript
import * as esbuild from 'esbuild';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const banner = `/* scripture-guide v${pkg.version} */`;

const shared = {
  entryPoints: ['src/scriptures.mjs'],
  bundle: true,
  banner: { js: banner },
  sourcemap: true,
};

// ESM build
await esbuild.build({
  ...shared,
  format: 'esm',
  outfile: 'dist/scriptures.mjs',
});

// CommonJS build
await esbuild.build({
  ...shared,
  format: 'cjs',
  outfile: 'dist/scriptures.cjs',
});

console.log('Built ESM and CJS bundles');
```

### 2. Update package.json

**Changes:**
```json
{
  "scripts": {
    "build": "node build/build.mjs"
  },
  "devDependencies": {
    "esbuild": "^0.20.0"
  }
}
```

**Remove devDependencies:**
- `@babel/cli`
- `@babel/core`
- `@babel/preset-env`
- `@babel/plugin-transform-modules-commonjs`

### 3. Delete obsolete files

- `build/build.cjs`
- `.babelrc`
- `babel.config.json`

### 4. Validation

Run `npm test` to verify output works correctly.

## Benefits

- Proper AST-based bundling (no regex hacks)
- Source maps for debugging
- Fast builds (milliseconds)
- Tree-shaking removes dead code
- Exports derived from source (no hardcoding)
- Better error messages

## Source Compatibility

All source files use clean ESM syntax. No changes required:
- `src/scriptures.mjs` — entry point
- `src/scriptdetect.mjs` — reference detection
- `src/scriptdetectcontext.mjs` — context-aware detection
- `src/scriptlib.mjs` — shared utilities
- `data/*.mjs` — data files with default exports
