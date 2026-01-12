export default {
  testEnvironment: 'node',
  transform: {},
  moduleFileExtensions: ['js', 'mjs'],
  testMatch: [
    '**/test/**/*.test.js',
    '**/test/**/*.test.mjs'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.mjs',
    '!src/**/*.test.mjs'
  ],
  setupFilesAfterEnv: ['./test/setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/test/_archive/'],
  verbose: true,
  reporters: [
    'default',
    ['./test/helpers/markdown-reporter.js', { outputFile: 'test-results.md' }]
  ]
};
