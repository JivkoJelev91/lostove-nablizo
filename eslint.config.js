const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  {
    ignores: ['.expo/**', 'dist/**', 'android/**', 'ios/**', 'node_modules/**'],
  },
  ...expoConfig,
  prettierConfig,
];
