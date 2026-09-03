import jsEslint from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import { defineConfig } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Shared ESLint flat config for Node/TypeScript packages.
 *
 * `tsconfigRootDir` defaults to `process.cwd()` — the directory ESLint was
 * invoked from — and not to `import.meta.dirname`, which once this package is
 * installed resolves to somewhere inside the consumer's `node_modules`. Spread
 * this config and override it only if you run ESLint from somewhere other than
 * the directory holding your tsconfig.
 *
 * Two plugins the copy this was distilled from carried are deliberately gone.
 *
 * `eslint-plugin-turbo` was registered and then never used — no `turbo/*` rule
 * was ever enabled — so it was a dependency in every consuming repo buying
 * nothing. Enabling `turbo/no-undeclared-env-vars` instead was the alternative,
 * and was rejected: turning a new rule on in a config five repos are about to
 * adopt is a behaviour change, and removing an inert plugin is not.
 *
 * `eslint-plugin-import` was carried for a single rule,
 * `import/no-extraneous-dependencies`. Three findings retired it, in order:
 *   1. `eslint-plugin-import@2.32.0` caps its peer range at ESLint 9 and is
 *      broken on 10 — `context.parserOptions` is gone, so its rules read
 *      `undefined`. `no-default-export` throws outright; the rule above just
 *      stopped reporting, silently.
 *   2. `eslint-plugin-import-x`, the maintained fork, does support ESLint 10 —
 *      but it pulls `unrs-resolver`, a native dependency with an install script,
 *      which every consuming repo would then have to approve.
 *   3. Neither matters, because the rule cannot fire in these repos anyway.
 *      Under pnpm's strict `node_modules` an undeclared import is by
 *      construction unresolvable, and the rule skips what it cannot resolve.
 * So the plugin bought a native dependency in five repos for a rule that is
 * structurally inert in all of them.
 */
const config = defineConfig([
  jsEslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
      parser: tsParser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: process.cwd(),
      },
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
    },
  },
  // Config files run by tooling are not part of the TS program; lint them
  // without type-aware rules.
  {
    files: ['**/*.config.{js,mjs,ts}'],
    languageOptions: {
      parserOptions: {
        projectService: false,
      },
    },
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'off',
    },
  },
  eslintConfigPrettier,
  {
    ignores: ['**/dist/**', '**/coverage/**', '**/.turbo/**'],
  },
]);

export default config;
