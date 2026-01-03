/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  ignorePatterns: [
    '.next/',
    'out/',
    'dist/',
    'coverage/',
    'playwright-report/',
    'test-results/',
    'cache/',
    'public/',
    // ad-hoc debug / node scripts
    '*.js',
    '*.mjs',
    '*.cjs',
    'scripts/',
    // storybook examples (optional)
    'src/stories/',
    // generated/notes
    '*.md',
  ],
  // Keep lint lightweight for CI: rely on Next/TS for deeper checks
  extends: [
    'eslint:recommended',
  ],
};
