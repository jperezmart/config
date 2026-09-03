import { createRequire } from 'node:module';

// Prettier resolves a bare plugin name from the *consumer's* directory, not from
// the package that named it. Under pnpm's strict node_modules the consumer
// cannot see this package's own dependencies, so bare strings fail with
// "Cannot find package 'prettier-plugin-sort-json'" — and bundling the plugins
// here, which is the entire reason this is a package rather than a copied file,
// would buy nothing. Resolving to absolute paths from this module makes them
// findable wherever the config is consumed from. Prettier accepts paths as
// readily as names.
const require = createRequire(import.meta.url);
const resolve = name => require.resolve(name);

/** @type {import("prettier").Config} */
const config = {
  endOfLine: 'lf',
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  arrowParens: 'avoid',
  plugins: [
    resolve('prettier-plugin-sort-json'),
    resolve('prettier-plugin-packagejson'),
  ],
};

export default config;
