import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import templateParser from '@angular-eslint/template-parser';
import templatePlugin from '@angular-eslint/eslint-plugin-template';

export default [
  {
    ignores: ['dist/**', 'node_modules/**']
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tsPlugin.configs.recommended.rules,
      'no-undef': 'off',
      'no-empty': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ]
    }
  },
  {
    files: ['src/**/*.html'],
    languageOptions: {
      parser: templateParser
    },
    plugins: {
      '@angular-eslint/template': templatePlugin
    },
    rules: {
      ...templatePlugin.configs.recommended.rules,
      '@angular-eslint/template/prefer-control-flow': 'off'
    }
  }
];
