// This repo eats its own cooking: it lints itself with the config it publishes.
// That is the cheapest possible check that `@jperezmart/eslint-config` loads and
// its plugin graph resolves — the failure mode the vendored copies shipped with.
import base from '@jperezmart/eslint-config/base';

export default [
  ...base,
  {
    // Everything here is plain JavaScript with no TypeScript program behind it,
    // so the type-aware half of the base config has nothing to read. Consumers
    // with real TypeScript sources do not need this block.
    languageOptions: {
      parserOptions: {
        projectService: false,
      },
    },
    rules: {
      '@typescript-eslint/no-unnecessary-condition': 'off',
    },
  },
];
