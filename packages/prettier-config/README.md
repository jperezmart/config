# @jperezmart/prettier-config

Shared Prettier config, bundling the `package.json` and JSON sorting plugins.

```sh
pnpm add -D @jperezmart/prettier-config prettier
```

`prettier` is a peer dependency. The two plugins are real dependencies, so they
come with the config rather than needing to be installed and listed separately —
which is the whole reason this is a package rather than a copied file.

## Use

```js
// prettier.config.mjs
export { default } from '@jperezmart/prettier-config';
```

Or reference it from `package.json`, which is enough when you have nothing to
override:

```json
{ "prettier": "@jperezmart/prettier-config" }
```

To override, spread it:

```js
import base from '@jperezmart/prettier-config';

export default { ...base, printWidth: 100 };
```

## What it sets

`singleQuote`, `trailingComma: 'all'`, `printWidth: 80`, `semi`, two-space
indentation, `arrowParens: 'avoid'`, `endOfLine: 'lf'`, and the
`prettier-plugin-sort-json` + `prettier-plugin-packagejson` plugins.

## History

This used to be `@jperezmart/eslint-config/prettier` — a Prettier config hiding
inside a package named `eslint-config`. That subpath is gone, with no
compatibility alias.
