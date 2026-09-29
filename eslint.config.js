const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  {
    ignores: ['.expo/**', 'dist/**', 'android/**', 'ios/**', 'node_modules/**'],
  },
  ...expoConfig,
  prettierConfig,
  {
    // No `any`. Prefer `unknown` at a boundary and narrow it, or model the shape with a type.
    // Use `as` only when the type is provably safe, and leave a comment saying why.
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
    },
  },
  {
    // Direct API calls belong in a feature or lib module, never in a screen or a shared
    // component. Import the function that wraps the call instead.
    files: ['src/app/**/*.{ts,tsx}', 'src/components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: 'Call a feature/lib function instead of fetch() in UI.' },
        {
          name: 'XMLHttpRequest',
          message: 'Call a feature/lib function instead of XMLHttpRequest in UI.',
        },
      ],
    },
  },
  {
    // Small files. A screen or component that needs more than this wants splitting.
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    rules: {
      'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': [
        'error',
        { max: 120, skipBlankLines: true, skipComments: true, IIFEs: true },
      ],
    },
  },
];
