import { readFileSync } from 'fs';
import { load as parse } from 'js-yaml';
import { glob } from 'glob';

/**
 * Load all fixture files or filter by language
 * @param {string|null} language - Language code (e.g., 'en', 'ko') or null for all
 * @returns {Array} Array of parsed fixture objects
 */
export function loadFixtures(language = null) {
  const pattern = language
    ? `test/fixtures/${language}.yml`
    : 'test/fixtures/*.yml';

  const files = glob.sync(pattern);

  if (files.length === 0) {
    console.warn(`No fixtures found for pattern: ${pattern}`);
    return [];
  }

  return files.map(file => {
    const content = readFileSync(file, 'utf8');
    return parse(content);
  });
}

/**
 * Extract test cases for a specific function and tier
 * @param {Array} fixtures - Array of fixture objects from loadFixtures
 * @param {string} fn - Function name: 'lookup', 'generate', 'detect'
 * @param {string} tier - Tier name: 'critical', 'edge_cases', 'invalid', 'known_issues'
 * @returns {Array} Flat array of test cases with language attached
 */
export function getTestCases(fixtures, fn, tier) {
  return fixtures.flatMap(f =>
    (f[fn]?.[tier] || []).map(tc => ({ ...tc, language: f.language }))
  );
}

/**
 * Load prose detection fixtures
 * @param {string|null} language - Language code or null for all
 * @returns {Object|Array} Single fixture object if language specified, array otherwise
 */
export function loadProseFixtures(language = null) {
  const pattern = language
    ? `test/fixtures/detect-prose/${language}.yml`
    : 'test/fixtures/detect-prose/*.yml';

  const files = glob.sync(pattern);

  if (files.length === 0) {
    throw new Error(`No prose fixtures found for pattern: ${pattern}`);
  }

  const fixtures = files.map(file => {
    const content = readFileSync(file, 'utf8');
    return parse(content);
  });

  return language ? fixtures[0] : fixtures;
}

/**
 * Load a prose sample file for snapshot testing
 * @param {string} language - Language code
 * @param {string} filename - Filename within the language folder
 * @returns {string} File contents
 */
export function loadProseSample(language, filename) {
  const path = `test/prose-samples/${language}/${filename}`;
  return readFileSync(path, 'utf8');
}
